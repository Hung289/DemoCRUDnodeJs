var express = require("express");
var router = express.Router();

const { body, validationResult } = require('express-validator');
const itemsModel = require("../../schemas/items");
const utilsHelpers = require('./../../helpers/utils');
const paramHelpers = require('./../../helpers/params');

router.get("(/status/:status)?", (req, res, next) => {
    let objWhere = {};

    let keyword = paramHelpers.getParam(req.query,'search','');
    let currentStatus = paramHelpers.getParam(req.params,'status','all');
    let statusFilter = utilsHelpers.createFilterStatus(currentStatus);
    let pagination = {
        totalItemsPerPage: 4,
        currentPage: 1,
        totalItems: 1,
        pageRanges: 3,
    }
    pagination.currentPage = parseInt(paramHelpers.getParam(req.query,'page',1));


    if(currentStatus === 'all'){
        if(keyword !== '') objWhere = {name: new RegExp(keyword, 'i')}
    }else{
        if(keyword !== '') objWhere = {status: currentStatus, name: new RegExp(keyword, 'i')}
        else objWhere = {status: currentStatus}
    }
    // if(currentStatus !== 'all') objWhere = {status: currentStatus}
    // if(keyword !== '') objWhere = {status: currentStatus, name: keyword};

    itemsModel.count(objWhere).then( (data) => {
        pagination.totalItems = data;
        itemsModel
            .find(objWhere)
            .sort({ordering: 'asc'})
            .skip((pagination.currentPage - 1) * pagination.totalItemsPerPage)
            .limit(pagination.totalItemsPerPage)
            .then((items) => {
                res.render("pages/items/item-list", {
                title: "Item - List Page",
                items: items,
                statusFilter: statusFilter,
                currentStatus: currentStatus,
                keyword,
                pagination
                });
            });
    })

    
});


router.get('/change-status/:id/:status', (req, res, next) => {
    let currentStatus = paramHelpers.getParam(req.params,'status','active');
    let id = paramHelpers.getParam(req.params,'id','');
    let status = (currentStatus === 'active') ? "unactive" : "active";

    let sysConfix = req.app.locals.systemConfig.prefixAdmin;
    itemsModel.findById({_id: id})
        .then( (itemResult) => {
            itemResult.status = status;
            itemResult.save().then((result) =>{
                req.flash('success', 'cập nhật thành công',false);
                res.redirect('/'+sysConfix+'/items/');
        });
    });
    //res.redirect('/${sysConfix}/items/');
})

//change mitil
router.post('/change-status/:status', (req, res, next) => {
    let currentStatus = paramHelpers.getParam(req.params,'status','active');
    let sysConfix = req.app.locals.systemConfig.prefixAdmin;
    itemsModel.updateMany({_id: {$in:req.body.cid}},{status: currentStatus},(err, result) =>{
                req.flash('success', `có ${result.n} phần tử cập nhật thành công`,false);
                res.redirect('/'+sysConfix+'/items/');
                if(err) {
                    req.flash('danger', 'cập nhật thất bại',false);
                    res.redirect('/'+sysConfix+'/items/'); 
                }
            });
});

router.get('/delete/:id', (req, res, next) => {
    let sysConfix = req.app.locals.systemConfig.prefixAdmin;
    let id = paramHelpers.getParam(req.params,'id','');
    itemsModel.deleteOne({ _id: id}, function(err) {
        if (!err) {
            req.flash('success', 'Xóa thành công',false);
            res.redirect('/'+sysConfix+'/items/');
        }
        else {
            console.log("Lỗi");
        }
    });
})
//delete mutil item
router.post('/delete', (req, res, next) => {
    
    let sysConfix = req.app.locals.systemConfig.prefixAdmin;
    itemsModel.remove({_id: {$in:req.body.cid}},(err, result) =>{
        req.flash('success', 'Xóa thành công',false);
        res.redirect('/'+sysConfix+'/items/');
    });
});

//change ordering multi
router.post('/change-ordering', (req, res, next) => {
    console.log(req.body);
    let sysConfix = req.app.locals.systemConfig.prefixAdmin;
    let cids = req.body.cid;
    let orderings = req.body.ordering;

    if(Array.isArray(cids)){
        cids.forEach((item, index) => {
            itemsModel.updateOne({_id: item},{ordering: parseInt(orderings[index])},(err, result) =>{
                
            });
        })
    }else{
        itemsModel.updateOne({_id: cids},{ordering: parseInt(orderings)}, (err, result) =>{
        
        });
    }
    req.flash('success', 'Thay đổi thành công thành công',false);
    res.redirect('/'+sysConfix+'/items/');

});


router.get(('/form(/:id)?'), (req, res, next) => {
    let id = paramHelpers.getParam(req.params, 'id', '');
   
    console.log(id);
    let item = {id: '',name: '', ordering: 0, status: 'novalue'};
    let errors = null;
    if(id === '') {
        res.render("pages/items/form", { 
            title: "Item Managerment- Add" , 
            itemEdit: item,
            errors
        });
    }else{
        itemsModel.findById({_id: id}, (err, result) => {
            res.render("pages/items/form", { 
                title: "Item Managerment- Edit",
                itemEdit: result,
                errors
            });
        })    
    } 
    // req.flash('info', 'if cats ruled the world',false) 
});


router.post('/save' ,[
        body('name','phải lớn hơn 5 và nhỏ hơn 20').isLength({min:5, max: 20}),
        body('ordering', 'Phải là số nguyên lớn hơn 0 va bé hơn 100').isInt({gt:0, lt:100}),
        body('status').custom((value) => {
            if(value === 'novalue'){
                throw new Error('phải khác rỗng')
            }
            return true;
        })
    ], (req, res, next) => {
    let errors = validationResult(req);
    let item = Object.assign(req.body);
    let sysConfix = req.app.locals.systemConfig.prefixAdmin;
    if(typeof item !== "undefined" && item.id !== "") {
        if(errors.errors.length !== 0){
            res.render("pages/items/form", { 
                title: "Item Managerment - Edit" , 
                errors:errors,
                itemEdit: item
            });
        }else{
            console.log('alo');
            itemsModel.updateOne({_id: item.id}, {
                name: item.name,
                ordering: parseInt(item.ordering),
                status: item.status
            }, (err, result) => {
                req.flash('success', 'Cập nhật thành công item',false);
                res.redirect('/'+sysConfix+'/items/');
            })
        } 
    }else{
        if(errors.errors.length !== 0){
            res.render("pages/items/form", { 
                title: "Item Managerment- Add" , 
                errors:errors,
                itemEdit: item
            });
        }else{
            
            // let item = {
            //     name: paramHelpers.getParam(req.body, 'name', ''),
            //     ordering: paramHelpers.getParam(req.body, 'ordering', '0'),
            //     status: paramHelpers.getParam(req.body, 'status', 'active'),
            // }
            console.log(item) 
            new itemsModel(item).save().then(() => {
                req.flash('success', 'Thêm mới thành công item',false);
                res.redirect('/'+sysConfix+'/items/');
            })
        } 
    }
    
})



module.exports = router;
