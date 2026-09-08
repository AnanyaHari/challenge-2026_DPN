# Write-up
Although I debated on adding a more sophisticated rating system (similar to Beli), I decided against it because it was very advanced. Additionally, I wanted to solidify the core utility of the website before adding on extra elements. Because of this, I built a list of restaurants visited, where the total price can be tracked. I did this because the original problem statement described the website as one that could keep track of food budget and I wanted to add a more basic feature to increase the usefulness of the website. Additionally, I think this is a good extension of the utility of the website that still stays in scope. 

I deliberately tried keeping this addition simple. When adding new features, it is very easy to lose scope and try doing too much. I decided to keep my addition simple. However, in an age where new features are much easier to add with AI, I am not sure if I made the right decision to add a more basic feature. 

I would change the flow of the website. Right now, the budget tracker is right below the list of restaurants visited for simplicity, but I would put the budget into a different tab to separate two different uses of the restaurant. Additionally, I would add a budget guideline, so the user can see how much money they have left in their budget for food. 
---

## Part B: routes

> Every endpoint you added, with its request and response shapes, so we can
> exercise it without reverse-engineering your code. Add or remove rows as
> needed; delete this section if your Part B added no routes.

| Method and path | What it does                     | Success               | Errors        |
| --------------- | -------------------------------- | --------------------- | ------------- |
| GET /api/visits | returns all restaurant visits    | 200 + array of visits | 500           |
| POST /api/visits| records a new visit and spending | 201 + created visit   | 400, 404, 500 |   

## How I verified this

**Part A** - the contract table in CHALLENGE.md, every row including the error
cases:

```bash
$ curl -i http://localhost:3000/api/restaurants - 200
$ curl -i http://localhost:3000/api/restaurants/1 - 200
$ curl -i http://localhost:3000/api/restaurants/abc - 500
$ curl -i -X POST http://localhost:3000/api/restaurants - 201
$ curl -i http://localhost:3000/api/restaurants -200
$ curl -i -X POST http://localhost:3000/api/restaurants -H 'Content-Type: application/json' -d '{"name":"Out of Range","rating":6}' - 400
$ curl -i -X POST http://localhost:3000/api/restaurants -H 'Content-Type: application/json' -d '{"name":"Zero Rating","rating":0}' - 201
$ curl -i -X POST http://localhost:3000/api/restaurants -H 'Content-Type: application/json' -d '{"name":"Five Rating","rating":5}' - 201
$ curl -i -X POST http://localhost:3000/api/restaurants -H 'Content-Type: application/json' -d '{}' - 400
$ curl -i -X POST http://localhost:3000/api/restaurants -H 'Content-Type: application/json' -d '{"name":"   "}' - 400
$ curl -i -X POST http://localhost:3000/api/restaurants -H 'Content-Type: application/json' -d '{"name":123}' - 400
$ curl -i -X POST http://localhost:3000/api/restaurants -H 'Content-Type: application/json' -d '{"name":"Negative","rating":-1}'- 400
$ curl -i -X POST http://localhost:3000/api/restaurants -H 'Content-Type: application/json' -d '{"name":"Too High","rating":5.1}' - 400
$ curl -i -X POST http://localhost:3000/api/restaurants -H 'Content-Type: application/json' -d '{"name":"String Rating","rating":"4.5"}' - 400
$ curl -i -X POST http://localhost:3000/api/restaurants -H 'Content-Type: application/json' -d '{"name":"Minimal Restaurant"}' - 201
$ curl -i -X POST http://localhost:3000/api/restaurants -H 'Content-Type: application/json' -d '{"name":"Null Fields","cuisine":null,"address":null,"rating":null}' - 201
$ curl -i -X POST http://localhost:3000/api/restaurants -H 'Content-Type: application/json' -d '{"name":"Wrong Cuisine","cuisine":123}' - 400
$ curl -i -X POST http://localhost:3000/api/restaurants -H 'Content-Type: application/json' -d '{"name":"Wrong Address","address":true}' - 400
$ curl -i -X POST http://localhost:3000/api/restaurants -H 'Content-Type: application/json' -d '[]' - 400
$ curl -i -X PUT http://localhost:3000/api/restaurants/abc -H 'Content-Type: application/json' -d '{"name":"Test","rating":4}' -404
$ curl -i -X PUT http://localhost:3000/api/restaurants/1 -H 'Content-Type: application/json' -d '{"rating":4}' - 400
$ curl -i -X DELETE http://localhost:3000/api/restaurants/ID - 404
$ curl -i -X DELETE http://localhost:3000/api/restaurants/2 - 204
$ curl -i -X POST http://localhost:3000/api/visits -H 'Content-Type: application/json' -d '{"restaurantId":1,"date":"2026-09-06","amountSpent":24.50,"notes":"Dinner with friends"}' - 201
```

**Part B** - the equivalent cases for what you built:

```bash
$ curl -i -X POST http://localhost:3000/api/visits -H 'Content-Type: application/json' -d '{"restaurantId":1,"date":"2026-09-06","amountSpent":0}' - 201
$ curl -i -X POST http://localhost:3000/api/visits -H 'Content-Type: application/json' -d '{"restaurantId":1,"date":"2026-09-06","amountSpent":null,"notes":null}' - 201
$ curl -i -X POST http://localhost:3000/api/visits -H 'Content-Type: application/json' -d '{"restaurantId":1,"date":"2026-09-06","amountSpent":-1}' - 400
$ curl -i -X POST http://localhost:3000/api/visits -H 'Content-Type: application/json' -d '{"restaurantId":1,"date":"2026-09-06","amountSpent":"24.50"}' - 400
$ curl -i -X POST http://localhost:3000/api/visits -H 'Content-Type: application/json' -d '{"restaurantId":1,"date":"2026-09-06","amountSpent":100000000}' - 400
$ curl -i -X POST http://localhost:3000/api/visits -H 'Content-Type: application/json' -d '{"restaurantId":1,"date":"2026-09-06","amountSpent":12.345}' - 201
$ curl -i -X POST http://localhost:3000/api/visits -H 'Content-Type: application/json' -d '{"restaurantId":1,"date":"2026-09-06","notes":123}' - 400
$ curl -i -X POST http://localhost:3000/api/visits -H 'Content-Type: application/json' -d '{"restaurantId":1,"date":"2026-09-06","notes":"   "}' - 201
$ curl -i -X POST http://localhost:3000/api/visits -H 'Content-Type: application/json' -d '{}' - 400
$ curl -i -X POST http://localhost:3000/api/visits -H 'Content-Type: application/json' -d '[]' - 400
$ curl -i http://localhost:3000/api/visits - 200
$ curl -i -X POST http://localhost:3000/api/restaurants -H 'Content-Type: application/json' -d '{"name":"taco bell","cuisine":"fast food","address":"1 Test Street","rating":5}' - 201
$ curl -i -X PUT http://localhost:3000/api/restaurants/11 -H 'Content-Type: application/json' -d '{"name":"taco bell edit","cuisine":"fast food","address":"2 Updated Street","rating":5}' - 200
$ curl -i -X DELETE http://localhost:3000/api/restaurants/10 - 204
$ curl -i -X DELETE http://localhost:3000/api/restaurants/10 - 404
$ curl -i -X DELETE http://localhost:3000/api/restaurants/9 - 204
$ curl -i -X DELETE http://localhost:3000/api/restaurants/8 - 204
$ curl -i -X DELETE http://localhost:3000/api/restaurants/7 - 204
$ curl -i -X DELETE http://localhost:3000/api/restaurants/6 - 204

```

## Known issues / what I'd do next

Nothing is broken, but I would want to add more features to make the site more usable and intuitive, as mentioned above. 
