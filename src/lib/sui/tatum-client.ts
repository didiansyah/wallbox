export async function tatumRpc<T=unknown>(method: string, params: unknown[] = []): Promise<T> {
  const url = process.env.TATUM_SUI_RPC_URL;
  const key = process.env.TATUM_API_KEY;
  if (!url || !key) throw new Error("TATUM_API_KEY and TATUM_SUI_RPC_URL are required for sui-tatum mode");
  const res = await fetch(url, { method:"POST", headers:{"content-type":"application/json", "x-api-key": key}, body:JSON.stringify({ jsonrpc:"2.0", id:Date.now(), method, params }) });
  if (!res.ok) throw new Error(`Tatum RPC failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  if (json.error) throw new Error(`Tatum RPC error: ${JSON.stringify(json.error)}`);
  return json.result as T;
}
