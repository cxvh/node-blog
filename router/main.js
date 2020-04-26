var express=require('express');
var router=express.Router();

var Category=require('../models/Category');
var Content=require('../models/Content');

var data;
/**
 * 处理通用数据
 */
router.use(function(req,res,next){
    data={
        userInfo:req.userInfo,
        categories:[]
    };
    Category.find().then(function(categories){
        data.categories=categories;
        next();
    });
});

router.get('/',function(req,res,next){
    //res.send('首页')
    //res.render('main/index.html')

        data.category=req.query.category||'',
        data.page=Number(req.query.page||1),
        data.count=0,
        data.limit=10,
        data.pages=0;
    var where={};
    if(data.category){
        where.category=data.category;
    }
    Category.where(where).count().then(function(count){
        data.count=count;
        // 计算总页数
        data.pages=Math.ceil(data.count/data.limit );
        //取最大页数不能大于pages
        data.page=Math.min(data.page,data.pages);
        //取最小页数不能小于1
        data.page=Math.max(data.page,1);

        data.skip=(data.page-1)*data.limit;
        return Content.where(where).find().sort({_id:-1}).limit(data.limit).skip(data.skip).populate(['category','user']).sort({addTime:-1});
    }).then(function(contents){
        data.contents=contents;
        res.render('main/index.html',data);
    });
})
router.get('/view',function(req,res,next){
    var contentId=req.query.contentid||'';
    Content.findOne({_id:contentId}).populate('user').then(function(content){
        data.content=content;

        content.views++;
        content.save();
        res.render('main/view',data);
        
    });
});
module.exports=router;


