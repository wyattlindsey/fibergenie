FiberGenie
=============

FiberGenie is a tool that helps knitters keep track of their current row and stitch. Other stitch counter apps abound, but only FiberGenie overlays the counter directly on your pattern. Upload an image file or snap a picture from your favorite knitting book. FiberGenie locates the rows and highlights the one you're working on. Voice control ensures your hands stay where you want them: on your knitting.

### Current features
* supports most image formats, including multi-page PDFs
* corrects skewed, speckled, warped or blurry images
* finds chart boundaries and internal row lines

### In development
* mobile app with native camera and voice support
* [Ravelry](https://www.ravelry.com/about) integration

Server
------
![knitting pattern before](https://github.com/wyattlindsey/fibergenie/blob/master/images/before_after.png)

JSON response:

```json
[
    {
        "boundingBox": {
            "p1": {
                "x": 0,
                "y": 88
            },
            "p2": {
                "x": 323,
                "y": 259
            }
        },
        "rowPositions": [
            88,
            106,
            123,
            140,
            157,
            174,
            191,
            208,
            225,
            242,
            259
        ]
    }
]
```

**Installation**
```
git clone git@github.com:wyattlindsey/fibergenie.git
cd fibergenie/server/
yarn
```

**Running**

From the `fibergenie/server/` directory, launch the application with Nodemon, Flow and ESLint using:
```
yarn start:dev
```

`POST` a request to `http://localhost:3000/image` using a client like Postman using `form-data` for the body format. Set a `chart` key and choose your [test file](https://github.com/wyattlindsey/fibergenie/blob/master/server/test/fixtures/images/beechleaf1.png) for the value.

![Postman settings](https://github.com/wyattlindsey/fibergenie/blob/master/images/postman_settings.png)

**Testing**

Run unit tests using Mocha, Sinon and Chai from the `fibergenie/server/` directory:
```
yarn test
```

**Miscellaneous**

To clean out the public uploads folder, run the following from the `fibergenie/server/` directory:
```
yarn clean:uploads
```
