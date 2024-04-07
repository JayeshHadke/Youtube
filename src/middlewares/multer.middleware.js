import multer from 'multer'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
        // originalname must be unique, you can add a timestamp to it
        cb(null, file.originalname);
    }
})

export const upload = multer({ storage: storage });