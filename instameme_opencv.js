const http = require('http');
const fs = require('fs');
const request = require('request');
const caption = require('caption');
const Faced = require('faced');
const Jimp = require("jimp");

const faced = new Faced();

const PORT = 80;

function httpGET(url) {
  return new Promise((res, rej) => {
    const lib = url.startsWith('https') ? require('https') : require('http');
    const request = lib.get(url, response => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        rej(response.statusCode);
      }
      const body = [];
      response.on('data', chunk => body.push(chunk));
      response.on('end', () => res(body.join('')));
    });
    request.on('error', err => rej(err))
  })
};

const download = function(uri, filename, callback) {
  return new Promise((resolve, reject) => {
    request.head(uri, function(err, res, body) {
      console.log('content-type:', res.headers['content-type']);
      console.log('content-length:', res.headers['content-length']);
      request(uri).pipe(fs.createWriteStream(filename)).on('close', resolve);
    });
  })
};

const recogFace = (fname) => {
  return new Promise((res, rej) => {
    faced.detect(fname, function (faces, image, file) {
      if (!faces) { res("nofaces"); return; }
      res(faces);
    });
  })
}

// ON SERVER START LOAD IN ILLUNIATY IMAGE

const modifyimg = (fname) => {
  return new Promise((res, rej) => {
    // Use jimp to load image (async)
    Jimp.read("./The-Illuminati-Eye.png", (err, ILLUMINATYEYES) => {

      Jimp.read(fname, (err, orig_img)=>{
        // Use faced to get face info
        recogFace(fname)
          .then(faces => {
            if (faces === "nofaces") {
            console.log(faces.length);
              // blah
              return;
            }

            console.log(faces.length);


            // // otherwise add illuminati eyes to each face
            // faces.forEach(face => {
            //   if (face.getEyeLeft()) {
            //     const eyeWidth = face.getEyeLeft().getWidth();
            //     const cords = {
            //       x:face.getEyeLeft().getX(),
            //       y:face.getEyeLeft().getY()
            //     }

            // console.log(ILLUMINATYEYES)

            //     // Use cords + Jimp to composite illuminaty eyes
            //     orig_img.blit(
            //       ILLUMINATYEYES,//.resize(eyeWidth, Jimp.AUTO), 
            //       cords.x, 
            //       cords.y
            //     );
            //   }
            //   // Same thing for right eye
            //   if (face.getEyeRight()) {
            //     const eyeWidth = face.getEyeRight().getWidth();
            //     const cords = {
            //       x:face.getEyeRight().getX(),
            //       y:face.getEyeRight().getY()
            //     }

            //     // Use cords + Jimp to composite illuminaty eyes
            //     orig_img.blit(
            //       ILLUMINATYEYES,//.resize(eyeWidth, Jimp.AUTO), 
            //       cords.x, 
            //       cords.y
            //     );
            //   }
            // })

            // // write output file, and resolve filepath of written file
            // // console.log(orig_img)
            // orig_img.write(fname + "new.jpg", ()=>{
            //   res(fs.readFileSync(fname));
            // });

            // write output file, and resolve filepath of written file
            // console.log(orig_img)
            orig_img.write(fname, ()=>{
              res(fs.readFileSync(fname));
            });
          })
      })
    })
  })
}
let count = 0;

function handleRequest(req, res) {
  const url = req.url.slice(1);
  const fname = "img/" + (++count) + ".jpg";

  download('http://10.84.67.85:8080/' + url, fname)
    .then(() => fname)
    .then(modifyimg)
    .then((new_img) => {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(new_img, 'binary');
    })
};
const server = http.createServer(handleRequest);
server.listen(PORT, () => {
  console.log("Server listening on: http://localhost:" + PORT);
});
