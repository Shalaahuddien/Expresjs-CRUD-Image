import { request } from "express";
import Product from "../models/ProductModel.js";
import path from "path";
import fs from "fs";

// menampilkan semua product
export const getProduct = async(req, res)=>{
    try{
        const response = await Product.findAll();
        res.json(response);
    } catch (error) {
        console.log(error.message);
    }
}

// menampilkan semua product by id
export const getProductById = async(req, res)=>{
    await Product.findOne({
        where:{
            id : req.params.id
        }
    }).then((user)=>{
        res.json(user);
    }).catch((err) => {
        res.status(500).json(err.message);
    })
}


// menyimpan product kedatabase
export const saveProduct = (req, res)=>{
    if(!req.files === null) return res.status(400).json({msg: "No File Uploaded"});
    const name = req.body.title;
    const file = req.files.file;

    // ukuran file
    const fileSize = file.data.length;
    // ekstensi file
    const ext = path.extname(file.name);
    // file yang sudah terenskripsi + ekstensi
    const fileName = file.md5 + ext;
    // url untuk ke DB
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
    // ekstensi yang diizinakan
    const allowedType = ['.png','.jpg','.jpeg'];
    // cek apakah ekstensi jpg jpeg atau png
    if(!allowedType.includes(ext.toLowerCase())) return res.status(422).json({msg: "Invalid Images"});
    // cek apakah ukuran image tidak lebih dari 5 MB
    if(fileSize > 5000000) return res.status(422).json({msg: "Image must be less than 5 MB"});

    // masukkan gambar ke dalam folder
    file.mv(`./public/images/${fileName}`, async(err)=>{
        if(err) return res.status(500).json({msg: err.message});
        try {
            await Product.create({name: name, image: fileName, url: url,});
            res.status(201).json({msg: "Product Created Successfuly"});
        } catch (error) {
            console.log(error.message);
        }
    })

}

// update product
export const updateProduct = async(req, res)=>{
    const product = await Product.findOne({
        where:{
            id : req.params.id
        }
    });
    if(!product) return res.status(404).json({msg: "No Data Found"});
    
    let fileName = "";
    if(req.files === null){
        fileName = product.image;
    }else{
        const file = req.files.file;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        fileName = file.md5 + ext;
        const allowedType = ['.png','.jpg','.jpeg'];

        if(!allowedType.includes(ext.toLowerCase())) return res.status(422).json({msg: "Invalid Images"});
        if(fileSize > 5000000) return res.status(422).json({msg: "Image must be less than 5 MB"});

        const filepath = `./public/images/${product.image}`;
        fs.unlinkSync(filepath);

        file.mv(`./public/images/${fileName}`, (err)=>{
            if(err) return res.status(500).json({msg: err.message});
        });
    }
    const name = req.body.title;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
    
    try {
        await Product.update({name: name, image: fileName, url: url},{
            where:{
                id: req.params.id
            }
        });
        res.status(200).json({msg: "Product Updated Successfuly"});
    } catch (error) {
        console.log(error.message);
    }
}

// hapus product
export const deleteProduct = async(req, res)=>{
    const product = await Product.findOne({
        where:{
            id : req.params.id
        }
    });
    if(!product) return res.status(404).json({msg: "No Data Found"});

    try {
        // ambil gambar spesifik
        const filepath = `./public/images/${product.image}`;
        // hapus gambar
        fs.unlinkSync(filepath);
        // hapus dari DB
        await Product.destroy({
            where:{
                id : req.params.id
            }
        });
        res.status(200).json({msg: "Product Deleted Successfuly"});
    } catch (error) {
        console.log(error.message);
    }
}