import multer from "multer";

// This multer function is used store file locally
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
export  const upload = multer({ storage: storage })