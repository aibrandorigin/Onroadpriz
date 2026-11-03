import assert from 'assert';
import { 
  SecretsManager, 
  REQUIRED_SECRET_KEYS, 
  SECRET_DEFINITIONS, 
  maskSecretValue,
  RequiredSecretKey 
} from '../src/server/config/secretsManager.js';
import { SmsService } from '../src/server/sms/smsService.js';
import { GeminiService } from '../src/server/ai/geminiService.js';

async function runTests() {
  console.log('--- STARTING SECRETS CONFIGURATION TEST SUITE ---');

  // Test 1: Verify all 9 required secret keys are specified with exact names
  console.log('Test 1: Verifying all 9 required keys exist...');
  const expectedKeys: RequiredSecretKey[] = [
    'GEMINI_API_KEY',
    'SMS_BASE_URL',
    'SMS_PE_ID',
    'SMS_USER',
    'SMS_PASSWORD',
    'SMS_DLT_TEMPLATE_ID',
    'SMS_CHANNEL',
    'SMS_SENDER_ID',
    'SMS_ROUTE',
  ];

  assert.strictEqual(REQUIRED_SECRET_KEYS.length, 9, 'Must have exactly 9 required keys');
  for (const key of expectedKeys) {
    assert.ok(REQUIRED_SECRET_KEYS.includes(key), `Key ${key} must be in REQUIRED_SECRET_KEYS`);
    assert.ok(SECRET_DEFINITIONS[key], `Key ${key} must have a definition`);
  }
  console.log('✓ All 9 required secret keys verified.');

  // Test 2: Initialize SecretsManager and verify loading
  console.log('Test 2: Initializing SecretsManager...');
  await SecretsManager.init();
  const metaList = SecretsManager.getAllPublicMeta();
  assert.strictEqual(metaList.length, 9, 'getAllPublicMeta() must return metadata for all 9 fields');

  for (const meta of metaList) {
    assert.ok(meta.key, 'Field must have a key');
    assert.ok(meta.label, 'Field must have a label');
    assert.ok(typeof meta.isConfigured === 'boolean', 'Field must have isConfigured boolean');
    assert.ok(typeof meta.isSecret === 'boolean', 'Field must have isSecret boolean');
    // Ensure raw secret is not leaked in maskedValue for secrets
    if (meta.isSecret && meta.isConfigured) {
      assert.ok(meta.maskedValue.includes('•'), `Secret ${meta.key} must be masked with bullet characters`);
    }
  }
  console.log('✓ SecretsManager metadata initialized and masked safely.');

  // Test 3: Masking logic
  console.log('Test 3: Testing maskSecretValue function...');
  assert.strictEqual(maskSecretValue('AIzaSyAbc12345DefGhi', true), 'AIza••••••••fGhi');
  assert.strictEqual(maskSecretValue('short', true), 'sh••••rt');
  assert.strictEqual(maskSecretValue('123', true), '••••••••');
  assert.strictEqual(maskSecretValue('https://ultronsms.com/api/mt/SendSMS', false), 'https://ultronsms.com/api/mt/SendSMS');
  console.log('✓ Masking logic functions properly.');

  // Test 4: Validation and preservation of existing values
  console.log('Test 4: Testing update validation & preservation...');
  
  // Test invalid URL format
  const invalidUrlResult = await SecretsManager.updateSecrets({
    SMS_BASE_URL: 'invalid-url-without-protocol'
  }, 'TestRunner');
  assert.strictEqual(invalidUrlResult.success, false, 'Should reject invalid URL');
  assert.ok(invalidUrlResult.errors && invalidUrlResult.errors.length > 0, 'Should return validation errors');

  // Test non-numeric PE ID
  const invalidPeIdResult = await SecretsManager.updateSecrets({
    SMS_PE_ID: 'not-numbers-xyz'
  }, 'TestRunner');
  assert.strictEqual(invalidPeIdResult.success, false, 'Should reject non-numeric PE ID');

  // Test saving valid update without wiping out other fields
  const originalSenderId = SecretsManager.get('SMS_SENDER_ID');
  const updateResult = await SecretsManager.updateSecrets({
    SMS_CHANNEL: 'Trans',
    SMS_ROUTE: '02'
  }, 'TestRunner');
  assert.strictEqual(updateResult.success, true, 'Should successfully update valid fields');
  assert.strictEqual(SecretsManager.get('SMS_SENDER_ID'), originalSenderId, 'Untouched fields must be preserved');
  console.log('✓ Update validation and preservation work correctly.');

  // Test 5: SMS Service Validation & Safe Dry-Run
  console.log('Test 5: Testing SMS Service parameter mapping & dry-run test...');
  const smsValidation = SmsService.validateConfiguration();
  assert.ok(typeof smsValidation.isValid === 'boolean', 'SMS validation returns boolean isValid');
  assert.ok(Array.isArray(smsValidation.errors), 'SMS validation returns errors array');

  const dryRunResult = await SmsService.testSmsConnection({ sendRealSms: false });
  assert.strictEqual(dryRunResult.mode, 'dry-run', 'Default test mode must be dry-run');
  assert.ok(dryRunResult.latencyMs >= 0, 'Latency must be reported');
  console.log('✓ SMS Service validation & dry-run test completed safely (no real SMS sent).');

  // Test 6: Gemini Service connectivity test
  console.log('Test 6: Testing Gemini Service connectivity test...');
  const geminiTest = await GeminiService.testConnection();
  assert.ok(typeof geminiTest.configured === 'boolean', 'Gemini test reports configured status');
  assert.strictEqual(geminiTest.model, 'gemini-3.8-flash', 'Model must be gemini-3.8-flash');
  if (geminiTest.success) {
    console.log(`✓ Gemini connected successfully! Latency: ${geminiTest.latencyMs}ms. Sample: "${geminiTest.sampleResponse}"`);
  } else {
    console.log(`ℹ Gemini test completed with safe error handling: ${geminiTest.error}`);
  }

  console.log('--- ALL TESTS PASSED SUCCESSFULLY! ---');
  process.exit(0);
}

runTests().catch(err => {
  console.error('TEST SUITE FAILED:', err);
  process.exit(1);
});
