export function generateActivationCode(): string {
  const prefix = 'FM';
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const random = Math.random().toString(36).toUpperCase().slice(2, 6);
  const combined = `${prefix}${timestamp}${random}`;
  const checksum = calculateChecksum(combined);
  
  return `${prefix}-${timestamp}-${random}-${checksum}`;
}

function calculateChecksum(input: string): string {
  let sum = 0;
  for (let i = 0; i < input.length; i++) {
    sum += input.charCodeAt(i);
  }
  return (sum % 10000).toString().padStart(4, '0');
}

export function validateActivationCodeFormat(code: string): boolean {
  const pattern = /^FM-[A-Z0-9]{4}-[A-Z0-9]{4}-\d{4}$/;
  if (!pattern.test(code)) return false;
  
  const parts = code.split('-');
  const prefix = parts[0];
  const timestamp = parts[1];
  const random = parts[2];
  const checksum = parts[3];
  
  const combined = `${prefix}${timestamp}${random}`;
  const expectedChecksum = calculateChecksum(combined);
  
  return checksum === expectedChecksum;
}
