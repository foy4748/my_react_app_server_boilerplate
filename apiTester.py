import requests as rq
import re

URL = "http://localhost:3001"
QUERY = "?uid=something_something"

def GET_TOKEN():
    header = { "Content-Type":"application/json", "uid":"something_something"   }
    url = URL + "/auth"
    res = rq.get(url,  headers=header)
    result = res.json()
    token = result["authtoken"]
    #print("Found Token", result["authtoken"])
    #forgedToken = re.sub(r"^.", "X", result["authtoken"])
    #print("Forged Token", forgedToken)
    GET(token)

def GET(TOKEN):
    header = { "Content-Type":"application/json", "authtoken":TOKEN,   }
    url = URL + "/" + QUERY
    res = rq.get(url, headers=header)
    result = res.json()
    print(result["query"])

GET_TOKEN()
