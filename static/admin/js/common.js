layui.config({
  base: '../../static/admin/js/module/'
}).extend({
  dialog: 'dialog',
});

layui.use(['form', 'jquery', 'laydate', 'layer', 'laypage', 'element'], function () {
  var form = layui.form,
    layer = layui.layer,
    $ = layui.jquery;
  //获取当前iframe的name值
  var iframeObj = $(window.frameElement).attr('name');
  //全选
  form.on('checkbox(allChoose)', function (data) {
    var child = $(data.elem).parents('table').find('tbody input[type="checkbox"]');
    child.each(function (index, item) {
      item.checked = data.elem.checked;
    });
    form.render('checkbox');
  });
  //渲染表单
  form.render();

  //列表添加
  $('#table-list').on('click', '.add-btn', function () {
    var url = $(this).attr('data-url');
    //将iframeObj传递给父级窗口
    parent.page("菜单添加", url, iframeObj, w = "700px", h = "620px");
    return false;
  })

  //列表跳转
  $('#table-list,.tool-btn').on('click', '.go-btn', function () {
    var url = $(this).attr('data-url');
    var id = $(this).attr('data-id');
    window.location.href = url + "?id=" + id;
    return false;
  })
  //编辑栏目
  $('#table-list').on('click', '.edit-btn', function () {
    var That = $(this);
    var id = That.attr('data-id');
    var url = That.attr('data-url');
    //将iframeObj传递给父级窗口
    parent.page("菜单编辑", url + "?id=" + id, iframeObj, w = "700px", h = "620px");
    return false;
  })
});

/**
 * 控制iframe窗口的刷新操作
 */
var iframeObjName;

//父级弹出页面
function page(title, url, obj, w, h) {
  if (title == null || title == '') {
    title = false;
  }
  ;
  if (url == null || url == '') {
    url = "404.html";
  }
  ;
  if (w == null || w == '') {
    w = '700px';
  }
  ;
  if (h == null || h == '') {
    h = '350px';
  }
  ;
  iframeObjName = obj;
  //如果手机端，全屏显示
  if (window.innerWidth <= 768) {
    var index = layer.open({
      type: 2,
      title: title,
      area: [320, h],
      fixed: false, //不固定
      content: url
    });
    layer.full(index);
  } else {
    var index = layer.open({
      type: 2,
      title: title,
      area: [w, h],
      fixed: false, //不固定
      content: url
    });
  }
}

/**
 * 刷新子页,关闭弹窗
 */
function refresh() {
  //根据传递的name值，获取子iframe窗口，执行刷新
  if (window.frames[iframeObjName]) {
    window.frames[iframeObjName].location.reload();

  } else {
    window.location.reload();
  }

  layer.closeAll();
}


function tableRender(cols, data) {
  layui.use(['table'], function () {
    var table = layui.table;
    table.render({
      elem: '#demo'
      , height: 520
      , url: '' //数据接口
      , data: data
      , title: '用户表'
      , page: true //开启分页
      , loading: true
      , toolbar: '#toolBar' //开启工具栏，此处显示默认图标，可以自定义模板，详见文档
      , cols: [cols]
    });
  })
}

function setTable(obj) {
  layui.use(['jquery', 'table', 'rate'], function () {
    var $ = layui.jquery;
    var table = layui.table;
    var rate = layui.rate;
    tableRender(obj.cols, obj.data);
    $('.addBtn').click(function () {  //add
      layer.open({
        type: 2,
        area: ['700px', '550px'],
        maxmin: true,
        content: obj.addUrl,
        success: function (layero, index) {
          obj.addSuc(layero, index) || '';
        },
        end: function () {
          obj.editEnd() || '';
        }
      })
    });

    var editUserData;
    table.on('checkbox(test)', function (xxx) {
      let index = parseInt(xxx.tr[0].querySelector('td .laytable-cell-numbers').innerText)-1;
      editUserData = obj.data[index];
    });

    if(obj.setSuc){
      obj.setSuc();
    }
    $('#edit').click(function () {//edit
      var checkNum = document.querySelectorAll("tbody input[type='checkbox']:checked").length;
      if (checkNum > 1) {
        layer.msg('一次只能编辑一行')
      } else if (checkNum <= 0) {
        layer.msg('请勾选要编辑的那一行');
      } else if (checkNum === 1) {
        layer.open({
          type: 2,
          area: ['700px', '450px'],
          maxmin: true,
          content: obj.editUrl,
          success: function (layero, index) {
            obj.editSuc(layero, index,editUserData);
          },
          end: function () {
            obj.editEnd() || '';
          }
        })
      }
    })

    $('#delete').click(function () {
      if (document.querySelectorAll("tbody input[type='checkbox']:checked").length <= 0) {
        layer.msg('请至少选中一行经行删除');
        return;
      }
      layer.confirm('确定要进行删除？', {
        btn: ['确定', '取消']
      }, function (index) {
        deleteCheckbox(obj.editEnd,obj.deleteUrl,obj.data);
        layer.close(layer.index)
      });
    })

    $('#exam').click(function(){
      if (document.querySelectorAll("tbody input[type='checkbox']:checked").length <= 0) {
        layer.msg('请至少选中一行经行审核');
        return;
      }
      layer.confirm('确定要进行审核？', {
        btn: ['确定', '取消']
      }, function (index) {
        var idArr = [];
        var checked = document.querySelectorAll("tbody input[type='checkbox']:checked");
        for (let i = 0; i < checked.length; i++) {
          let tr = checked[i].parentNode.parentNode.parentNode.children[1].getElementsByTagName('div')[0].innerText;
          idArr.push(obj.data[parseInt(tr)-1].id);
        }
        AJAX({
          url:obj.checkUrl,
          method:"POST",
          data:{id:idArr.join()},
          success:function(){
            console.log(idArr.join())
            obj.editEnd();
            layer.close(layer.index)
          }
        })
      });
    })

    $('#search').click(function(){
      let value = document.getElementById('search_input').value;
      AJAX({
        url:'http://58.144.34.96:5000/web_manager/public/index.php/index/Data/searchPeopleByName ',
        method:'POST',
        data:{
          username:value
        },
        success:function(data) {
          if (data.state == 200) {
            layer.open({
              type: 2,
              title: '搜索结果',
              area: ['900px', '550px'],
              content: obj.alertTab,
              maxmin: true,
              success: function (layero, index) {
                var iframe = window['layui-layer-iframe' + index];
                iframe.getFromParent(data, obj);
              }
            })
          }
        }
      })
      // searchClickFunc(value);
    });

    function searchClickFunc(value){
      if(value){
        AJAX({
          url:'http://58.144.34.96:5000/web_manager/public/index.php/index/Data/searchPeopleByName ',
          method:'POST',
          data:{
            username:value
          },
          success:function(data){
            if(data.state==200){
              if(data.data){
                var cols = [ //表头
                  {type: 'checkbox'}
                  , {title: 'id',align:'center',type:'numbers'}
                  , {field: 'username', title: '姓名',align:'center'}
                  //, {field: 'sex', title: '性别',align:'center',templet:'<span>{{sexIndex[d.sex]}}</span>'}
                  , {field: 'id_number', title: '身份证号',align:'center'}
                  , {field: 'area', title: '所属区域',align:'center',templet:'<span>{{areaOption[d.area]}}</span>'}
                  , {field: 'address', title: '住址',align:'center'}
                  , {field: 'grid', title: '所属网格',align:'center',templet:'<span>{{gridOption[d.grid]}}</span>'}
                  // , {field: 'gridman', title: '网格管理员',align:'center'}
                  // , {field: 'state', title: '状态',align:'center'}
                  , {field: '',title:"操作",align:'center',templet:'#detail',width:'20%'}
                ];
                function editSuc(layero, index, data){
                  var iframe = window['layui-layer-iframe' + index];
                  var editData = [
                    {0:'id',            1:'ID   ',   2:data['id']||''},
                    // {0:'area',          1:"所属区域", 2:data['area']||''},
                    {0:'community_id',          1:"所属小区", 2:data['community_id']||''},
                    {0:'username',          1:"姓名", 2:data['username']||''},
                    {0:'sex',1:{title:'性别',option:sexOption}},
                    {0:'age',          1:"年龄", 2:data['age']||''},
                    {0:'native_place',          1:"籍贯", 2:data['native_place']||''},
                    {0:'ethnicity',          1:"民族", 2:data['ethnicity']||''},
                    {0:'id_number',          1:"身份证号", 2:data['id_number']||''},
                    // {0:'work_place',          1:"工作地点", 2:data['work_place']||''},
                    // {0:'org_id',          1:"组织关系", 2:data['org_id']||''},
                    {0:'grid',          1:{title:'所属网格',option:gridOption}},
                    {0:'building_id',          1:"所属楼栋", 2:data['building_id']||''},
                    // {0:'birth_date',          1:"出生日期", 2:data['birth_date']||''},
                    // {0:'is_insured',          1:"是否参保", 2:data['is_insured']||''},
                    {0:'marriage',          1:"婚姻状况", 2:data['marriage']||''},
                    {0:'phone',          1:"联系电话", 2:data['phone']||''},
                    {0:'political_status',          1:"政治面貌", 2:data['political_status']||''},
                    // {0:'enterprise_name',          1:"单位名称", 2:data['enterprise_name']||''},
                    // {0:'unit_id',          1:"所属单元", 2:data['unit_id']||''},
                    {0:'relation_with_host',          1:"与户主关系", 2:data['relation_with_host']||''},
                    {0:'population_type',          1:"人口类型", 2:data['population_type']||''},
                    // {0:'occupation',          1:"职业", 2:data['occupation']||''},
                    {0:'education',          1:"文化程度", 2:data['education']||''},
                    // {0:'enterprise_address',          1:"单位地址", 2:data['enterprise_address']||''},
                    // {0:'pic',          1:"图片", 2:data['pic']||''},
                    {0:'address',          1:"街路巷（组）", 2:data['address']||''},
                    {0:'resident_address',          1:"户籍详址", 2:data['resident_address']||''},
                    {0:'comment',          1:"注释", 2:data['comment']||''},
                    // {0:'enterprise_type',          1:"企业性质", 2:data['enterprise_type']||''},
                    {0:'house_code',          1:"门牌号", 2:data['house_code']||''},
                    {0:'room_code',          1:"房号", 2:data['room_code']||''},
                    {0:'is_renthouse',          1:"是否为出租房", 2:data['is_renthouse']||''},
                    {0:'housing_property',          1:"房屋性质", 2:data['housing_property']||''},
                    {0:'self_name',          1:"(个人产权)姓名", 2:data['self_name']||''},
                    {0:'edit_time',          1:"编辑时间", 2:data['edit_time']||''},
                    // {0:'agent_name',          1:"(代理人信息)姓名", 2:data['agent_name']||''},
                    // {0:'agent_address',          1:"(代理人信息)联系地址", 2:data['agent_address']||''},
                    // {0:'agent_enterprise_name',          1:"(代理单位信息)单位名", 2:data['agent_enterprise_name']||''},
                    // {0:'agent_enterprise_contact',          1:"(代理单位信息)联系人", 2:data['agent_enterprise_contact']||''},
                    // {0:'resident_district',          1:"流往地详址", 2:data['resident_district']||''},
                    // {0:'resident_province',          1:"流出到省", 2:data['resident_province']||''},
                    // {0:'living_reason',          1:"居住事由", 2:data['living_reason']||''},
                    {0:'city',          1:"户籍县(区)", 2:data['city']||''},
                    // {0:'floating_reason',          1:"流动原因", 2:data['floating_reason']||''},
                    // {0:'in_date',          1:"来本市日期", 2:data['in_date']||''},
                    // {0:'out_date',          1:"流出时间", 2:data['out_date']||''},
                    // {0:'has_jycard',          1:{title:'是否办理缙云卡',option:['否','是']}},
                    // {0:'out_province',          1:"流出到省", 2:data['out_province']||''},
                    // {0:'out_city',          1:"流出到到市", 2:data['out_city']||''},
                    // {0:'out_district',          1:"流往地详址", 2:data['out_district']||''},
                    // {0:'out_address',          1:"所属区域", 2:data['out_address']||''},
                    {0:'edit_people',          1:"编辑人", 2:data['edit_people']||''},
                    {0:'is_single_parent',          1:{title:'单亲家庭',option:['否','是']}},
                    {0:'is_single_old',          1:{title:'独居老人',option:['否','是']}},
                    {0:'metal_disease',          1:{title:'精神障碍',option:['否','是']}},
                    {0:'is_correctional',          1:{title:'社区矫正人员',option:['否','是']}},
                    {0:'is_released',          1:{title:'刑满释放人员',option:['否','是']}},
                    {0:'is_xj',          1:{title:'XJ人员',option:['否','是']}},
                    {0:'is_xd',          1:{title:'XD人员',option:['否','是']}},
                    {0:'is_special_care',          1:{title:'优抚对象',option:['否','是']}},
                    {0:'is_disabled',          1:{title:'残疾人',option:['否','是']}},
                    {0:'is_leftover_children',          1:{title:'留守儿童',option:['否','是']}},
                    {0:'has_critical_disease',          1:{title:'重疾人员',option:['否','是']}},
                    {0:'is_empty_nester',          1:{title:'空巢老人',option:['否','是']}},
                    {0:'is_poor',          1:{title:'经济困难人员',option:['否','是']}},
                    {0:'is_veteran',          1:{title:'退伍军人',option:['否','是']}},
                    {0:'is_jobless',          1:{title:'下岗职工',option:['否','是']}},
                    {0:'is_sanwu',          1:{title:'三无人员',option:['否','是']}},
                    {0:'is_dibao',          1:{title:'低保人员',option:['否','是']}},
                    {0:'is_overseas_student',          1:{title:'留学人员',option:['否','是']}},
                    {0:'is_overseas_chinese',          1:{title:'归国华侨',option:['否','是']}},
                    {0:'is_cflac_member',          1:{title:'文联会员',option:['否','是']}},
                    {0:'is_ftu_member',          1:{title:'工会会员',option:['否','是']}},
                  ];
                  var url =  'http://58.144.34.96:5000/web_manager/public/index.php/index/Data/editPeople';
                  iframe.getFromParent(editData,url);
                }
                function editEnd(){
                  searchClickFunc(value);
                }
                function addSuc(layero, index){
                  var iframe = window['layui-layer-iframe' + index];
                  // var addData = [
                  //   {0:'area',1:"区域"},
                  //   {0:"grid",1:'网格'},
                  //   {0:'log_name',1:'日志名称'},
                  //   {0:"log_type",1:{
                  //       'title':'类型',
                  //       'option':['巡查','走访 ','宣传','处理','重点人员寻访']
                  //     }},
                  //   {0:"content",1:"日志内容"},
                  // ]
                  var addData = aaa;
                  var url =  'http://58.144.34.96:5000/web_manager/public/index.php/index/Data/addPeopleData';
                  iframe.getFromParent(addData,url);
                }
                var addUrl = './alert/sdlr.html';
                var editUrl = './alert/edit.html';
                var editAjaxUrl =  'http://58.144.34.96:5000/web_manager/public/index.php/index/Data/editPeople';
                var detailUrl = './alert/detail.html';
                var deleteUrl = 'http://58.144.34.96:5000/web_manager/public/index.php/index/Data/deletePeopleData';
                var setT = function() {
                  setTable({
                    addUrl: addUrl,
                    editUrl: editUrl,
                    cols: cols,
                    data: data.data,
                    editSuc: editSuc,
                    editEnd: editEnd,
                    addSuc: addSuc,
                    editAjaxUrl: editAjaxUrl,
                    deleteUrl: deleteUrl,
                    detailUrl: detailUrl
                  })
                };
                setT();
              }
            }else{
              layer.msg('错误');
            }
          }
        })
      }else{
        layer.msg('请输入搜索内容');
      }
    }

    var resetClick = function () {
      $('.detail').click(function () {
        var convalue = this.getAttribute('convalue');
        var idX = this.parentNode.parentNode.parentNode.parentNode.children[1].getElementsByTagName('div')[0].innerText;
        layer.open({
          title:'详情',
          type: 2,
          area: ['800px', '500px'],
          maxmin: true,
          content: obj.detailUrl,
          success: function (layero, index) {
            if(obj.detailSpecial){
              var detailData = {};
              for(let i in obj.dataX['missionDetail']){
                detailData[i] = obj.dataX['missionDetail'][i];
              }
              for(let i in obj.data[index-1]){
                detailData[i] = obj.data[index-1][i];
              }
              console.log(detailData);
              let iframe = window['layui-layer-iframe' + index];
              iframe.getFromParent(detailData);
            }else{
              console.log(obj.data[convalue])
              var iframe = window['layui-layer-iframe' + index];
              iframe.getFromParent(obj.data[convalue]);
            }
          }
        })
      })
      $('.score').click(function () {
        var convalue = this.getAttribute('convalue');
        var idX = this.parentNode.parentNode.parentNode.parentNode.children[1].getElementsByTagName('div')[0].innerText;
        // AJAX({
        //   url: "http://47.106.197.31/manage/api.php?action=isRanked",
        //   method: "POST",
        //   data: {id: idX},
        //   success(data) {
        //     var _data = JSON.parse(data);
            layer.open({
              title: '评分',
              type: 2,
              area: ['500px', '400px'],
              maxmin: true,
              content: obj.scoreUrl,
              success: function (layero, index) {
                var iframe = window['layui-layer-iframe' + index];
                iframe.getFromParent(obj.data[convalue]);
              }
            })
          // }
        // })
      })
      $('.finished').click(function(){
        var idX = this.parentNode.parentNode.parentNode.parentNode.children[1].getElementsByTagName('div')[0].innerText;
        AJAX({
          url:obj.postFinish,
          method:'POST',
          data:{id:obj.data[parseInt(idX)-1].id},
          success:function(data){
            if(data.state==200){
              layer.open({
                type: 2,
                title: '完成情况',
                area:['900px','550px'],
                content: obj.workFinish,
                maxmin: true,
                success: function (layero, index) {
                  var iframe = window['layui-layer-iframe' + index];
                  iframe.getFromParent(data, idX);
                }
              })
            }
          }
        })
      })
      $('.member').click(function(){
        var idX = this.parentNode.parentNode.parentNode.parentNode.children[1].getElementsByTagName('div')[0].innerText;
        AJAX({
          // url:obj.postFinish,
          url:'http://58.144.34.96:5000/web_manager/public/index.php/index/Data/selectMembersByName',
          method:'POST',
          data:{
            house_holder:obj.data[parseInt(idX)-1].house_holder
          },
          success:function(data){
            if(data.state==200){
              layer.open({
                type: 2,
                title: '家庭成员',
                area:['900px','550px'],
                content: obj.workFinish,
                maxmin: true,
                success: function (layero, index) {
                  var iframe = window['layui-layer-iframe' + index];
                  iframe.getFromParent(data, idX);
                }
              })
            }
          }
        })
      })
      $('.deal').click(function () {
        var convalue = this.getAttribute('convalue');
        layer.open({
          title:'详情',
          type: 2,
          area: ['800px', '500px'],
          maxmin: true,
          content: obj.dealUrl,
          success: function (layero, index) {
            if(obj.detailSpecial){
              var detailData = {};
              for(let i in obj.dataX['missionDetail']){
                detailData[i] = obj.dataX['missionDetail'][i];
              }
              for(let i in obj.data[index-1]){
                detailData[i] = obj.data[index-1][i];
              }
              let iframe = window['layui-layer-iframe' + index];
              iframe.getFromParent(detailData);
            }else{
              console.log(obj.data[convalue])
              var iframe = window['layui-layer-iframe' + index];
              iframe.getFromParent(obj.data[convalue]);
            }
          },
          end:function(){
            obj.editEnd();
          }
        })
      })
      $('.editapp').click(function () {
        var convalue = this.getAttribute('convalue');
        layer.open({
          type: 2,
          area: ['700px', '450px'],
          maxmin: true,
          content: obj.editUrl,
          success: function (layero, index) {
            obj.editAppSuc(layero, index,obj.data[convalue].app_info);
          },
          end: function () {
            obj.editEnd() || '';
          }
        })
      })
      $('.check').click(function(){
        var convalue = this.getAttribute('convalue');
        layer.alert('确定要审核',{
          yes:function(){
            AJAX({
              url:obj.checkUrl,
              method:'POST',
              data:{id:obj.data[convalue]['id']},
              success(){
                obj.editEnd();
                var index = layer.alert();
                layer.close(index);
              }
            })
          }
        })
      })
    }
    //点page 重挂click 太恶心了框架
    $('.layui-table-page').click(function () {
      resetClick();
    })
    resetClick();
  })
}

function echartExcel(result) {
  let arr = [];
  let obj = {};
  let xxx;
  let aaa = [];
  let flag = false;
  for (let i in result) {
    if (objnum(result[i]) === 1) {
      if (i != 0) {
        obj['data'] = aaa;
        arr.push(obj);
        obj = {};
        aaa = [];
      }
      obj['title'] = result[i].title;
    } else {
      xxx = {'type': result[i].title, 'data': result[i].__EMPTY};
      aaa.push(xxx);
    }
    if (i == result.length - 1) {
      obj['data'] = aaa;
      arr.push(obj);
      obj = {};
      aaa = [];
    }
  }
  console.log(arr)
  return arr;
}

function objnum(obj) {
  let i = 0;
  for (let n in obj) {
    i++;
  }
  return i;
}

function deleteCheckbox(editEnd,deleteUrl,data) {
  var idArr = [];
  layui.use(['jquery', 'layer'], function () {
    var $ = layui.jquery;
    var checked = document.querySelectorAll("tbody input[type='checkbox']:checked");
    for (let i = 0; i < checked.length; i++) {
      let tr = checked[i].parentNode.parentNode.parentNode.children[1].getElementsByTagName('div')[0].innerText;
      idArr.push(data[parseInt(tr)-1].id);
    }
    for(let i in idArr){
      AJAX({
        url: deleteUrl,
        method: "POST",
        data: {'id':idArr[i]},
        success:function(){
          editEnd();
        }
      })
    }
  })
}

//-----------------------------------------------------------------

function setCookie(c_name,value,expireseconds){
  var exdate=new Date();
  exdate.setTime(exdate.getTime()+expireseconds * 1000);
  document.cookie=c_name+ "=" +escape(value)+
    ((expireseconds==null) ? "" : ";expires="+exdate.toGMTString())
}
function getCookie(c_name) {
  if (document.cookie.length > 0) {
    c_start = document.cookie.indexOf(c_name + "=");
    if (c_start != -1) {
      c_start = c_start + c_name.length + 1;
      c_end = document.cookie.indexOf(";", c_start);
      if (c_end == -1) {
        c_end = document.cookie.length;
      }

      return unescape(document.cookie.substring(c_start, c_end));
    }
  }

  return "";
}
function delCookie(name){
  var exp = new Date();
  exp.setTime(exp.getTime() - 1);
  var cval=getCookie(name);
  if(cval!=null)
    document.cookie= name + "="+cval+";expires="+exp.toGMTString();
}

//-------------------------------------------------
//柱图
function ssr1(obj) {
  layui.use(['jquery'], function () {
    var $ = layui.jquery;
    var myChart = echarts.init(document.querySelector(obj.el));
    myChart.clear();

    option = {
      title:{
        left: 'center',
        text: obj.title,
      },
      grid: {
        x: "8%",
        y: "5%"
      },
      xAxis: {
        type: 'category',
        data: obj.xAxisData
      },
      yAxis: {
        type: 'value'
      },
      tooltip: {
        show: true,
      },
      series: [{
        data: obj.seriesData,
        type: 'line',
        symbol: 'triangle',
        symbolSize: 20,
        lineStyle: {
          normal: {
            color: '#e7e7e7',
            width: 4,
            type: 'dashed'
          }
        },
        itemStyle: {
          normal: {
            borderWidth: 3,
            borderColor: 'rgba(255,255,255,0.5)',
            color: 'rgba(167,190,267,0.5)'
          }
        }
      }]
    };
    myChart.setOption(option);
    myChart.on('click', function (e) {
      console.log(e)
    });
    //防止调用太快
    var boor = true;

    function resizes() {
      boor = true;
      myChart.resize();
    }

    $(window).resize(function () {
      if (boor) {
        boor = false;
        setTimeout(resizes, 500);
      }
    })
  })
}

//饼图
function ssr2(obj) {
  layui.use(['jquery'], function () {
    var $ = layui.jquery;
    var myChart = echarts.init(document.querySelector(obj.el));
    myChart.clear();
    option = {
      title: {
        left: 'center',
        text:obj.title,
        top: 20,
        textStyle: {
          color: '#ccc'
        }
      },

      tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
      },

      visualMap: {
        show: false,
        min: 100,
        max: 600,
        inRange: {
          colorLightness: [0, 1]
        }
      },
      series: [
        {
          name: '访问来源',
          type: 'pie',
          radius: '55%',
          center: ['50%', '50%'],
          data: [
            {value: 335, name: '直接访问'},
            {value: 310, name: '邮件营销'},
            {value: 274, name: '联盟广告'},
            {value: 235, name: '视频广告'},
            {value: 400, name: '搜索引擎'}
          ].sort(function (a, b) {
            return a.value - b.value;
          }),
          // data:[43,234,223,12,43,543],
          roseType: 'radius',
          label: {
            normal: {
              textStyle: {
                color: 'rgba(255, 255, 255, 0.3)'
              }
            }
          },
          labelLine: {
            normal: {
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.3)'
              },
              smooth: 0.2,
              length: 5,
            }
          },
          itemStyle: {
            normal: {
              color: obj.color,
            }
          },

          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDelay: function (idx) {
            return Math.random() * 200;
          }
        }
      ]
    };
    myChart.setOption(option);
    myChart.on('click', function (e) {
      console.log(e)
    });
    //防止调用太快
    var boor = true;

    function resizes() {
      boor = true;
      myChart.resize();
    }

    $(window).resize(function () {
      if (boor) {
        boor = false;
        setTimeout(resizes, 500);
      }
    })
  })
}

//横轴柱图
function ssr3(el, data) {
  layui.use(['jquery'], function () {
    var $ = layui.jquery;
    var myChart = echarts.init(document.querySelector(el));
    myChart.clear();

    option = {
      legend: {
        show: false
      },
      tooltip: {
        trigger: 'item',
        show: true
      },
      yAxis: {
        type: 'category',
        data: [23,544,23,23,45,65],
        axisTick: {
          show: false,
          lineStyle: {
            // color: '#0ff'
          },
        },
        axisLabel: {
          interval: 0,
          textStyle: {
            // color: "#0ff",
            fontSize: 10,
          },
        }
      },
      xAxis: {
        type: 'value',
        splitLine: {
          show: false
        },
        axisTick: {
          show: true,
          lineStyle: {
            // color: '#0ff'
          },
        },
        axisLabel: {
          textStyle: {
            // color: "#0ff",
            fontSize: 10,
          },
        }
      },
      grid: {
        right: '20px',
        top: '0',
        left: '10px',
        bottom: '15px',
        containLabel: true
      },
      series: [{
        //name: str.dataName,
        type: 'bar',
        data: [23,12,43,54,65],
        barMaxWidth: 20,
        label: {
          normal: {
            show: true,
            position: 'right',
            textStyle: {
              fontSize: 10
            }
          }
        },
        itemStyle: {
          normal: {
            color: function (params) {
              var colorList = ['#3fc1e8', '#4285f4', '#54b7ff', '#3fe8ca', '#5aa5ff', '#0095ff', '#1c74b3', '#45ff8f', '#66fdff', '#50e9c1', '#313186', '#7e62fb', '#bb7ef1', '#004a81', '#e9aff3'];
              return colorList[params.dataIndex];
            }
          }
        }
      }]
    };
    myChart.setOption(option);
    myChart.on('click', function (e) {
      console.log(e);
    });
    //防止调用太快
    var boor = true;

    function resizes() {
      boor = true;
      myChart.resize();
    }

    $(window).resize(function () {
      if (boor) {
        boor = false;
        setTimeout(resizes, 500);
      }
    })
  })
}

//折线图
function ssr4(el, online, offline) {
  layui.use(['jquery'], function () {
    var $ = layui.jquery;
    var myChart = echarts.init(document.querySelector(el));
    myChart.clear();

    option = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['在线人数', '离线人数'],
        x: 'right',
        itemWidth: 18,
        itemHeight: 12,
        textStyle: {
          color: '#72d9e3'
        }
      },
      grid: {
        top: '35px',
        left: '20px',
        right: '10px',
        bottom: '5px',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: name,
        axisTick: {
          show: false,
          lineStyle: {
            color: '#0ff'
          },
        },
        axisLabel: {
          interval: 0,
          rotate: 45,
          textStyle: {
            color: "#0ff",
            fontSize: 10,
          },
        },
        axisLine: {
          lineStyle: {
            color: "#72d9e3"
          }
        }
      },
      yAxis: {
        axisLine: {
          lineStyle: {
            color: "#72d9e3"
          }
        },
        type: 'value',
        splitLine: {
          show: false
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: '#0ff'
          },
        },
        axisLabel: {
          textStyle: {
            color: "#0ff",
            fontSize: 10,
          },
        }
      },
      series: [
        {
          name: '在线人数',
          type: 'line',
          itemStyle: {
            color: "#3fc1e8"
          },
          label: {
            show: true,
            color: '#72d9e3'
          },
          data: online
        },
        {
          name: '离线人数',
          type: 'line',
          itemStyle: {
            color: "#4285f4"
          },
          label: {
            show: true,
            color: '#72d9e3'
          },
          data: offline
        }
      ]
    };
    myChart.setOption(option);
    myChart.on('click', function (e) {
      console.log(e);
    });
    //防止调用太快
    var boor = true;

    function resizes() {
      boor = true;
      myChart.resize();
    }

    $(window).resize(function () {
      if (boor) {
        boor = false;
        setTimeout(resizes, 500);
      }
    })
  })
}

function ssr6(el, online, offline) {
  layui.use(['jquery'], function () {
    var $ = layui.jquery;
    var myChart = echarts.init(document.querySelector(el));
    myChart.clear();

    option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: [
        {
          name: '未处理',
          type: 'line',
          stack: '总量',
          areaStyle: {},
          data: [120, 132, 101, 134, 90, 230, 210]
        },
        {
          name: '处理中',
          type: 'line',
          stack: '总量',
          areaStyle: {},
          data: [220, 182, 191, 234, 290, 330, 310]
        },
        {
          name: '已处理',
          type: 'line',
          stack: '总量',
          areaStyle: {},
          data: [150, 232, 201, 154, 190, 330, 410]
        },
        {
          name: '其他',
          type: 'line',
          stack: '总量',
          label: {
            normal: {
              show: true,
              position: 'top'
            }
          },
          areaStyle: {normal: {}},
          data: [820, 932, 901, 934, 1290, 1330, 1320]
        }
      ]
    };
    myChart.setOption(option);
    myChart.on('click', function (e) {
      console.log(e);
    });
    //防止调用太快
    var boor = true;

    function resizes() {
      boor = true;
      myChart.resize();
    }

    $(window).resize(function () {
      if (boor) {
        boor = false;
        setTimeout(resizes, 500);
      }
    })
  })
}

//走势图
function ssr5(el, data) {
  layui.use(['jquery'],function() {
    var $ = layui.jquery;
    var myChart = echarts.init(document.querySelector(el));
    var axisData = [],
      value = [];
    data.forEach(function (val, i) {
      axisData[i] = val.name.substring(5);
      value[i] = val.value;
    })

    var links = value.map(function (item, i) {
      return {
        source: i,
        target: i + 1
      };
    });
    links.pop();
    myChart.clear();
    option = {
      title: {
        text: '事件提交统计',
        x: 'center',
        y: '1%',
        textStyle: {
          fontSize: 16,
          color: '#0ff'
        }

      },
      tooltip: {},
      xAxis: {
        type: 'category',
        boundaryGap: true,
        data: axisData,
        axisTick: {
          show: true,
          lineStyle: {
            color: '#0ff'
          },
        },
        axisLabel: {
          interval: 0,
          textStyle: {
            color: "#0ff",
            fontSize: 10,
          },
        },
        axisLine: {
          lineStyle: {
            color: "#72d9e3"
          }
        }
      },
      grid: {
        left: '15px',
        top: '20px',
        right: '25px',
        bottom: '10px',
        containLabel: true
      },
      yAxis: {
        axisLine: {
          lineStyle: {
            color: "#72d9e3"
          }
        },
        type: 'value',
        splitLine: {
          show: false
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: '#0ff'
          },
        },
        axisLabel: {
          textStyle: {
            color: "#0ff",
            fontSize: 10,
          },
        }
      },
      series: [
        {
          type: 'graph',
          layout: 'none',
          coordinateSystem: 'cartesian2d',
          symbolSize: 15,
          label: {
            normal: {
              show: false
            }
          },
          edgeSymbol: ['circle', 'arrow'],
          edgeSymbolSize: [4, 10],
          data: data,
          links: links,
          lineStyle: {
            normal: {
              color: '#0ff'
            }
          },
          itemStyle: {
            color: '#4892ff'
          }
        }
      ]
    };
    myChart.setOption(option);
    myChart.on('click', function (e) {
      console.log(e);
    });
    //防止调用太快
    var boor = true;

    function resizes() {
      boor = true;
      myChart.resize();
    }

    $(window).resize(function () {
      if (boor) {
        boor = false;
        setTimeout(resizes, 500);
      }
    })
  })
}

function ssr7(el, data) {
  layui.use(['jquery'], function () {
    var $ = layui.jquery;
    var myChart = echarts.init(document.querySelector(el));
    myChart.clear();

    option = {
      angleAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        z: 10
      },
      radiusAxis: {},
      polar: {},
      series: [{
        type: 'bar',
        data: [1, 2, 3, 4, 3, 5, 1],
        coordinateSystem: 'polar',
        name: 'A',
        stack: 'a'
      }, {
        type: 'bar',
        data: [2, 4, 6, 1, 3, 2, 1],
        coordinateSystem: 'polar',
        name: 'B',
        stack: 'a'
      }, {
        type: 'bar',
        data: [1, 2, 3, 4, 1, 2, 5],
        coordinateSystem: 'polar',
        name: 'C',
        stack: 'a'
      }]
    };
    myChart.setOption(option);
    myChart.on('click', function (e) {
      console.log(e);
    });
    //防止调用太快
    var boor = true;

    function resizes() {
      boor = true;
      myChart.resize();
    }

    $(window).resize(function () {
      if (boor) {
        boor = false;
        setTimeout(resizes, 500);
      }
    })
  })
}

function ssr8(el, data, title) {
  layui.use(['jquery'], function () {
    var $ = layui.jquery;
    var myChart = echarts.init(document.querySelector(el));
    myChart.clear();

    option = {
      xAxis: {},
      yAxis: {},
      grid: {
        x: 20,
        y: 30,
        x2: 20,
        y2: 30,
      },
      series: [{
        symbolSize: 20,
        data: [
          [10.0, 8.04],
          [8.0, 6.95],
          [13.0, 7.58],
          [9.0, 8.81],
          [11.0, 8.33],
          [14.0, 9.96],
          [6.0, 7.24],
          [4.0, 4.26],
          [12.0, 10.84],
          [7.0, 4.82],
          [5.0, 5.68]
        ],
        type: 'scatter'
      }]
    };
    myChart.setOption(option);
    myChart.on('click', function (e) {
      console.log(e)
    });
    //防止调用太快
    var boor = true;

    function resizes() {
      boor = true;
      myChart.resize();
    }

    $(window).resize(function () {
      if (boor) {
        boor = false;
        setTimeout(resizes, 500);
      }
    })
  })
}

//--------------------------------------------------

function jsonData(data){
  var obj = {};
  for(let i in data){
    obj[i] = data[i];
  }
  return obj;
}

//--------------------------------------------------

function AJAX(obj){
  layui.use(['jquery','layer'],function(){
    var $ = layui.jquery;
    var layer = layui.layer;
    $.ajax({
      url:obj.url,
      method:obj.method,
      data:obj.data,
      headers:{'Authorization':getCookie('Authorization')},
      success:obj.success,
      error:function(){
        layer.msg('错误');
      }
    })
  })
}

var gridOption = [];
function setGridOption(){
  AJAX({
    url: 'http://58.144.34.96:5000/web_manager/public/index.php/index/System/gridList',
    method:'POST',
    success:function(data){
      var _data = data.data;
      for(let i in _data){
        gridOption.push(_data[i].name);
      }
    }
  })
}
if(getCookie('Authorization')){
  setGridOption();
}
