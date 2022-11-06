import requests as rq

URL = "http://localhost:3001"
QUERY = "?uid=something_something"

def GET_TOKEN():
    header = { "Content-Type":"application/json", "uid":"something_something"   }
    url = URL + "/auth"
    res = rq.get(url,  headers=header)
    result = res.json()
    GET(result["authtoken"])

def GET(TOKEN):
    header = { "Content-Type":"application/json", "authtoken":TOKEN,   }
    url = URL + "/" + QUERY
    res = rq.get(url, headers=header)
    result = res.json()
    for item in result["data"]:
        print(item["img"])

GET_TOKEN()
