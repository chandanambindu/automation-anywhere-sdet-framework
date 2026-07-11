async function expectOkAndJson(response) {
  if (!response) throw new Error('No response provided');
  if (!response.ok) {
    const text = await response.text().catch(() => 'unable to read body');
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${text}`);
  }
  try {
    return await response.json();
  } catch (e) {
    throw new Error('Response is not valid JSON');
  }
}

module.exports = { expectOkAndJson };
