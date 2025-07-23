async def test_get_me(client):
    res = await client.get("/healthz")
    assert res.status_code == 200
    assert res.json() == "OK"
