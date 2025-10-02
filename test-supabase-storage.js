/**
 * Test script to debug Supabase Storage issues
 * Run with: node test-supabase-storage.js
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('=== Supabase Storage Test ===\n');

console.log('[1] Environment Variables Check:');
console.log('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
console.log('  SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓ Set' : '✗ Missing');
console.log('  URL value:', supabaseUrl);
console.log('  Service key length:', supabaseServiceKey?.length || 0);
console.log();

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testStorage() {
  try {
    // Test 1: List all buckets
    console.log('[2] Testing bucket access...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('  ❌ Error listing buckets:', bucketsError);
      return;
    }
    
    console.log('  ✓ Available buckets:', buckets.map(b => b.name).join(', '));
    console.log();
    
    // Check if 'audio' bucket exists
    const audioBucket = buckets.find(b => b.name === 'audio');
    if (!audioBucket) {
      console.error('  ❌ "audio" bucket does not exist!');
      console.log('  → You need to create an "audio" bucket in Supabase Storage');
      return;
    }
    
    console.log('  ✓ "audio" bucket found');
    console.log('    - ID:', audioBucket.id);
    console.log('    - Public:', audioBucket.public);
    console.log('    - Created:', audioBucket.created_at);
    console.log();
    
    // Test 2: Try to upload a test file
    console.log('[3] Testing file upload...');
    const testContent = Buffer.from('Test audio file', 'utf-8');
    const testFileName = `test-uploads/test-${Date.now()}.txt`;
    
    console.log('  Uploading test file:', testFileName);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio')
      .upload(testFileName, testContent, {
        contentType: 'text/plain',
        upsert: false,
      });
    
    if (uploadError) {
      console.error('  ❌ Upload failed:', uploadError);
      console.error('  Error details:', JSON.stringify(uploadError, null, 2));
      return;
    }
    
    console.log('  ✓ Upload successful');
    console.log('    - Path:', uploadData.path);
    console.log();
    
    // Test 3: Get public URL
    console.log('[4] Testing public URL generation...');
    const { data: publicUrlData } = supabase.storage
      .from('audio')
      .getPublicUrl(testFileName);
    
    console.log('  ✓ Public URL:', publicUrlData.publicUrl);
    console.log();
    
    // Test 4: Try to download the file
    console.log('[5] Testing file download...');
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('audio')
      .download(testFileName);
    
    if (downloadError) {
      console.error('  ❌ Download failed:', downloadError);
      return;
    }
    
    console.log('  ✓ Download successful');
    console.log('    - Size:', downloadData.size, 'bytes');
    console.log();
    
    // Test 5: Clean up - delete test file
    console.log('[6] Cleaning up test file...');
    const { error: deleteError } = await supabase.storage
      .from('audio')
      .remove([testFileName]);
    
    if (deleteError) {
      console.error('  ⚠ Warning: Could not delete test file:', deleteError);
    } else {
      console.log('  ✓ Test file deleted');
    }
    console.log();
    
    console.log('=== All tests passed! ✓ ===');
    console.log('\nYour Supabase Storage is configured correctly.');
    console.log('The issue might be in the API handler or authentication.');
    
  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
    console.error('Stack trace:', error.stack);
  }
}

testStorage();
