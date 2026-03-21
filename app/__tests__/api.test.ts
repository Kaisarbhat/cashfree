import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api } from '../lib/api';

const mockFetch = vi.fn();
global.fetch = mockFetch;

function mockOk(data: unknown) {
  mockFetch.mockResolvedValueOnce({ ok:true, status:200, json: async()=>data });
}
function mockErr(data: unknown, status=400) {
  mockFetch.mockResolvedValueOnce({ ok:false, status, json: async()=>data });
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.restoreAllMocks());

describe('api.aadhaarSendOtp', () => {
  it('sends aadhaar_number to correct endpoint', async () => {
    mockOk({ ref_id:'REF123' });
    const result = await api.aadhaarSendOtp('999941057058');
    expect(mockFetch.mock.calls[0][0]).toContain('/kyc/aadhaar/send-otp');
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toMatchObject({ aadhaar_number:'999941057058' });
    expect(result.ok).toBe(true);
    if (result.ok) expect((result.data as Record<string,unknown>).ref_id).toBe('REF123');
  });

  it('returns ok:false on error', async () => {
    mockErr({ message:'Invalid Aadhaar' });
    const r = await api.aadhaarSendOtp('123');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('Invalid Aadhaar');
  });

  it('returns ok:false on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    const r = await api.aadhaarSendOtp('999941057058');
    expect(r.ok).toBe(false);
  });
});

describe('api.aadhaarVerifyOtp', () => {
  it('sends ref_id and otp', async () => {
    mockOk({ status:'VALID' });
    await api.aadhaarVerifyOtp('REF123','123456');
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toEqual({ ref_id:'REF123', otp:'123456' });
  });
});

describe('api.digilockerInitiate', () => {
  it('sends empty body when no redirect_url', async () => {
    mockOk({ url:'https://digilocker.gov.in/...' });
    await api.digilockerInitiate();
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toEqual({});
  });

  it('sends redirect_url when provided', async () => {
    mockOk({ url:'https://digilocker.gov.in/...' });
    await api.digilockerInitiate('https://myapp.com/callback');
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.redirect_url).toBe('https://myapp.com/callback');
  });
});

describe('api.panLite', () => {
  it('sends pan to correct endpoint', async () => {
    mockOk({ pan_status:'VALID', name:'JOHN DOE' });
    const result = await api.panLite('ABCDE1234F');
    expect(mockFetch.mock.calls[0][0]).toContain('/kyc/pan/lite');
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toEqual({ pan:'ABCDE1234F' });
    expect(result.ok).toBe(true);
  });

  it('returns ok:false on API error', async () => {
    mockErr({ message:'Invalid PAN' });
    const r = await api.panLite('INVALID');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('Invalid PAN');
  });
});

describe('api.pan360', () => {
  it('sends pan without dob', async () => {
    mockOk({ pan_status:'VALID' });
    await api.pan360('ABCDE1234F');
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toEqual({ pan:'ABCDE1234F' });
  });

  it('includes dob when provided', async () => {
    mockOk({ pan_status:'VALID' });
    await api.pan360('ABCDE1234F','1990-01-01');
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toEqual({ pan:'ABCDE1234F', dob:'1990-01-01' });
  });
});

describe('api.bavSync', () => {
  it('sends account and ifsc', async () => {
    mockOk({ account_status:'ACTIVE' });
    await api.bavSync('1234567890','HDFC0001234');
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toMatchObject({ account_number:'1234567890', ifsc:'HDFC0001234' });
  });

  it('includes name when provided', async () => {
    mockOk({ account_status:'ACTIVE' });
    await api.bavSync('1234567890','HDFC0001234','JOHN DOE');
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.name).toBe('JOHN DOE');
  });
});

describe('api.bavAsync', () => {
  it('sends account, ifsc, reference_id', async () => {
    mockOk({ status:'QUEUED' });
    await api.bavAsync('1234567890','HDFC0001234','my-ref-001');
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toMatchObject({ account_number:'1234567890', ifsc:'HDFC0001234', reference_id:'my-ref-001' });
  });
});

describe('api.ifsc', () => {
  it('calls ifsc endpoint', async () => {
    mockOk({ bank_name:'HDFC BANK' });
    const r = await api.ifsc('HDFC0000001');
    expect(mockFetch.mock.calls[0][0]).toContain('/kyc/ifsc');
    expect(r.ok).toBe(true);
  });
});

describe('api.reversePennyDrop', () => {
  it('sends empty body when no name provided', async () => {
    mockOk({ upi:'user@upi', name_at_bank:'JOHN' });
    await api.reversePennyDrop();
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toEqual({});
    expect(mockFetch.mock.calls[0][0]).toContain('/kyc/reverse-penny-drop');
  });

  it('includes name when provided', async () => {
    mockOk({ name_at_bank:'JOHN' });
    await api.reversePennyDrop('JOHN DOE');
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toEqual({ name:'JOHN DOE' });
  });
});

describe('api.nameMatch', () => {
  it('sends name1 and name2', async () => {
    mockOk({ score:88, result:'MATCH' });
    const result = await api.nameMatch('Rajesh Kumar','R. Kumar');
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toEqual({ name1:'Rajesh Kumar', name2:'R. Kumar' });
    expect(result.ok).toBe(true);
  });
});

describe('api.vkycInitiate', () => {
  it('sends agent_mode=false by default', async () => {
    mockOk({ link:'https://verify.cashfree.com/...' });
    await api.vkycInitiate();
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toEqual({ agent_mode:false });
  });

  it('sends agent_mode=true when specified', async () => {
    mockOk({ link:'https://verify.cashfree.com/...' });
    await api.vkycInitiate(true);
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.agent_mode).toBe(true);
  });
});

describe('api.aaConsent', () => {
  it('sends mobile and period', async () => {
    mockOk({ consent_id:'AA123' });
    await api.aaConsent('+919876543210','LAST_6_MONTHS');
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toEqual({ mobile:'+919876543210', period:'LAST_6_MONTHS' });
  });
});

describe('api.health', () => {
  it('calls GET health endpoint', async () => {
    mockOk({ status:'ok', cashfree_reachable:true });
    const r = await api.health();
    expect(mockFetch.mock.calls[0][0]).toContain('/kyc/health');
    expect(r.ok).toBe(true);
  });
});

describe('raw response field', () => {
  it('includes endpoint, status, response', async () => {
    mockOk({ pan_status:'VALID' });
    const r = await api.panLite('ABCDE1234F');
    const raw = JSON.parse(r.raw);
    expect(raw).toHaveProperty('endpoint');
    expect(raw).toHaveProperty('status');
    expect(raw).toHaveProperty('response');
  });
});
