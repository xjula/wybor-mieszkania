import unittest
from fastapi.testclient import TestClient
from backend.main import create_app
from backend.ranking import evaluate

def examples():
    return [dict(id=i+1,name=n,price=p,minutes=m) for i,(n,p,m) in enumerate([
        ("A",450000,35),("B",490000,15),("C",520000,10)])]

class RankingTests(unittest.TestCase):
    def test_reversal_and_exclusion(self):
        for w,winner in [(70,"A"),(30,"B")]:
            r=evaluate(examples(),500000,w)
            self.assertEqual(r["ranked"][0]["name"],winner)
            self.assertAlmostEqual(r["ranked"][0]["score"],.7)
            self.assertEqual(r["excluded"][0]["excess"],20000)
    def test_tie_and_boundary(self):
        self.assertEqual([o["place"] for o in evaluate(examples(),500000,50)["ranked"]],[1,1])
        self.assertEqual(evaluate(examples(),450000,100)["ranked"][0]["score"],1)
        self.assertFalse(evaluate(examples(),1,0)["ranked"])

class MemoryStore:
    def init(self):
        self.rows={o["id"]:o for o in examples()};self.budget=500000;self.weight=70
    def state(self):return dict(budget=self.budget,weight=self.weight,offers=list(self.rows.values()))
    def save_offer(self,data,offer_id=None):
        if offer_id is not None and offer_id not in self.rows:return None
        i=offer_id or max(self.rows,default=0)+1
        self.rows[i]=dict(id=i,**data);return {"id":i}
    def delete_offer(self,i):return self.rows.pop(i,None) is not None
    def preferences(self,budget,weight):self.budget,self.weight=budget,weight

class ApiTests(unittest.TestCase):
    def setUp(self):
        self.c=self.enterContext(TestClient(create_app(MemoryStore())))
    def test_crud_and_preferences(self):
        data=dict(name="Nowa",location="Kielce, KSM",price=400000,minutes=5)
        r=self.c.post("/api/offers",json=data);self.assertEqual(r.status_code,201);i=r.json()["id"]
        self.assertEqual(self.c.get("/api/state").json()["ranked"][0]["location"],"Kielce, KSM")
        self.assertEqual(self.c.get("/api/state").json()["ranked"][0]["id"],i)
        self.assertEqual(self.c.put(f"/api/offers/{i}",json={**data,"price":550000}).status_code,200)
        self.assertEqual(self.c.put("/api/preferences",json={"budget":500000,"weight":30}).status_code,200)
        s=self.c.get("/api/state").json();self.assertEqual(s["ranked"][0]["name"],"B")
        self.assertIn(i,[o["id"] for o in s["excluded"]])
        self.assertEqual(self.c.delete(f"/api/offers/{i}").status_code,200)
        self.assertEqual(self.c.delete(f"/api/offers/{i}").status_code,404)
    def test_invalid_input(self):
        self.assertEqual(self.c.post("/api/offers",json=dict(name=" ",price=0,minutes=-1)).status_code,422)
        self.assertEqual(self.c.put("/api/preferences",json=dict(budget=10,weight=101)).status_code,422)
