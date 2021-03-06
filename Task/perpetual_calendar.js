/*
 * @Author: Xin https://github.com/Xin-code 
 * @Date: 2021-05-30 20:55:07 
 * @Last Modified by: Xin 
 * @Last Modified time: 2021-06-07 15:39:11
 * 
 * IOS端 AppStore 搜索[万年历]
 * 🔗下载链接:https://mobile.wnlpromain.com:12443/score483/sharedetails2.html?code=3odb62
 * 20000金币=1元
 */

const $ = Env('万年历')

const URLArr = []

const WNL_API_HOST = 'https://r.51wnl-cq.com'

$.message = ''

const notify = $.isNode() ? require('./sendNotify') : '';

// 任务集合
const missionArr = []

$.success = true

$.redPacket = true

$.total = 0

// 默认提现
$.cash = 10

if ($.isNode()) {
  if (process.env.WNL_TOKEN && process.env.WNL_TOKEN.indexOf('#') > -1) {
    wnlToken = process.env.WNL_TOKEN.split('#');
  }else if(process.env.WNL_TOKEN && process.env.WNL_TOKEN.indexOf('#') > -1) {
    wnlToken = process.env.WNL_TOKEN.split('\n');
  }else{
    wnlToken = [process.env.WNL_TOKEN]
  }

  Object.keys(wnlToken).forEach((item) => {
    if (wnlToken[item]) {
      URLArr.push(wnlToken[item])
    }
  })
}

!(async () => {
  for (let i = 0; i < URLArr.length; i++) {

    url = URLArr[i];

    console.log(`········【帐号${i+1}】开始········`)

    $.num = 0

    // 初始化个人信息
    console.log(`执行 -> 初始化个人信息`);
    await init_info()

    // 邀请好友
    console.log(`\n执行 -> 邀请好友`);
    await invite_new()

    // 任务列表
    console.log(`\n执行 -> 任务列表`);
    await task_list()

    // 红包签到
    if($.redPacket){
      console.log(`\n执行 -> 红包签到`);
      await hb_sign()
    }else{
      console.log(`跳过红包签到`);
    }

    // 完成任务
    console.log(`\n执行 -> 完成任务`)
    for (let i = 0; i <10; i++){
      console.log(`\n开始第${i+1}次循环，去完成任务···`);
      for (let i = 0; i < missionArr.length; i++){
        mission = missionArr[i]
        console.log(`\n当前执行任务:[${mission}]`);
        await finish_task(mission)
        if(result.data.coin){
            console.log(`等待了10s···`);
            await $.wait(10000) // 避免 重复操作 10s
        }
        if(!$.success){
            $.message+='\n❗未完成任务\n❗设置的Token过期或者设置错误，请检查后再填入Secret内'
            break;
        }
      }
      if($.success){
        console.log(`等待了60s···`);
        await $.wait(60000) // 避免 重复操作 1分钟后继续操作
      }else{
        break;
      }
    }

    // 金币兑换红包
    console.log(`\n执行 -> 金币兑换红包`);
    await exchange_gold_to_money()

    // 提现记录 查看是否上一次提现完成
    await draw_log()
    
    $.num++

    // 推送消息
    await init_info()
    console.log(`\n执行 -> 推送消息`);
    await sendMsg()

    console.log(`········【帐号${i+1}】结束········`)

  }
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())


// ==================功能模块==================
// 初始化个人信息
async function init_info(){
  // 初始化个人信息API
  await init_info_API();
  // console.log(result);
  if(result.status!==200){
    console.log(`❌ ${result.msg}`);
  }else{
    let info  = result.data
    // 个人信息
    // console.log(info);
    // 当前用户可兑换金币数量
    $.initCoin =info.coin
    // 当前用户可提前零钱数量
    $.initMoney =(info.cash)/100
    // 初始化的时候只打印 不推送通知
    if($.num===0){
      console.log(`当前登录用户ID:[${info.userId}]\n最后一次签到时间:${info.lastSign},已经连续签到[${info.signContinued}]天\n总金币为:[${info.coin}]💰 总零钱为:${info.cash/100}元🧧`);
    }else{
      // 推送通知
      $.message+=`\n\n当前登录用户ID:[${info.userId}]\n最后一次签到时间:${info.lastSign},已经连续签到[${info.signContinued}]天\n\n本日获得金币:[${info.todayCoin}]💰 ≈ 红包[${info.todayCoin/20000}]元\n当前用户总金币为:[${info.coin}]💰 总零钱为:${info.cash/100}`
      console.log(`当前登录用户ID:[${info.userId}]\n最后一次签到时间:${info.lastSign},已经连续签到[${info.signContinued}]天\n\n本日获得金币:[${info.todayCoin}]💰 ≈ 红包[${info.todayCoin/20000}]元\n当前用户总金币为:[${info.coin}]💰 总零钱为:${info.cash/100}元`);
    }

  }
}

// 邀请好友
async function invite_new(){
  // 邀请好友API
  await invite_new_API();
  // console.log(result)
  if(result.status!==200){
    console.log(`❌ ${result.msg}`)
  }else{
    if(result.data.coin!==0){
        console.log(`本次获得金币💰:${result.data.coin}个`)
        if(result.data.coin!==undefined){
            $.total+=result.data.coin
        }
    }else{
        console.log(`${result.data.msg}`);
    }
  }
}

// 任务列表
async function task_list(){
  // 获取任务列表API
  await task_list_API()
  // console.log(result);
  result.data.forEach((item)=>{
    // console.log(item);
    // 日常签到 type =1
    if(item.type === 1){
        missionArr.push(item.code)
    }
    // 新手任务 type=3 || 每日任务 type=4
    else if(item.type === 3||item.type ===4){
      // console.log(`新手任务`);
      let mission = item.missions
      mission.forEach((subItem)=>{
        // console.log(subItem.subItems);
        missionArr.push(subItem.subItems[0].code)
      })
    }
    else{
        let info = []
        if(item.hongbaos!==undefined){
          item.hongbaos.forEach((item)=>{
            info.push(`${item/100}元`)
        })
        if(info.length===3) $.redPacket = false
        $.message+=`${info.length===3?`历史获得红包${info},已经获得所有红包!`:`历史获得红包：${info}，总计获得${item.count}个红包，今日${item.isGetHongBaoToday===1?"已经":"未"}获得红包`}`
        console.log(`${info.length===3?`历史获得红包${info},已经获得所有红包!`:`历史获得红包：${info}，总计获得${item.count}个红包，今日${item.isGetHongBaoToday===1?"已经":"未"}获得红包`}`);
        }else{
          console.log(`❌ 获取红包失败`);
        }
    }
  })
  if(missionArr.length!==0){
    console.log(`✅已获取所有的任务`);
  }
}

// 红包签到
async function hb_sign() {
    // 红包签到API
    await hb_sign_API()
    // console.log(result);
    if(result.status!==200){
      console.log(`❌ ${result.msg}`)
    }else{
      console.log(`获得${result.data.cash/100}元`)
    }
  }


// 完成任务
async function finish_task(mission){
  // 完成任务API
  await finish_task_API(mission)
    // console.log(result);
    if(result.status!==200){
      console.log(`❌ ${result.data.msg}`);
    }else{
      if(result.data.coin!==0){
        console.log(`本次获得金币💰:${result.data.coin}个`)
        if(result.data.coin!==undefined){
          $.total+=result.data.coin
        }
      }else{
        console.log(`${result.data.msg}`);
        if(result.data.msg==='无效的用户'){
          $.success = false
        }
      }
      return
    }
    return
}

// 金币兑换红包
async function exchange_gold_to_money(){

  // 金币兑换红包的最大值
  $.ExChangeCoin = $.initCoin - ($.initCoin%200)

  if($.ExChangeCoin>200){
    // 获得红包的数量
    $.ExChangeMoney = `本次脚本运行兑换红包🧧${($.initCoin - ($.initCoin%200))/20000}元`
    console.log(`【去兑换】\n当前可以兑换金币的最大数为：${$.initCoin - ($.initCoin%200)}个 ≈ 红包${($.initCoin - ($.initCoin%200))/20000}元`);
    // 金币兑换红包API
    await exchange_gold_to_money_API();
    // console.log(result);
    if(result.status!==200){
      console.log(`❌ ${result.msg}`);
    }else{
      console.log(`${result.data===true?"兑换成功!获得红包["+$.ExChangeMoney+"]元":result.msg}`);
    }
  }else{
    console.log(`当前金币${$.initCoin}个，不执行换零钱操作`);
  }

}

// 提现记录 查看是否上一次提现完成
async function draw_log(){
  // 提现记录API
  await draw_log_API();
  // console.log(result);
  // 提现记录
  let logArr = result.data
  let canCashArr = []
  logArr.forEach(async(item)=>{
    canCashArr.push(item.status)
  })
  // console.log(canCashArr);
  // status=0,1,2,3为不可提现，status=4为提现成功可进行下一次提现
  if(canCashArr[0]===4){
    console.log(`\n执行 -> 零钱提现`);
    // await withdraw()
  }else{
    console.log(`当前不能提现，还未完成提现任务或正在提现中···`);
  }
}

// 提现
async function withdraw(){
  if($.initMoney<$.cash){
    console.log(`当前零钱为:${$.initMoney},不够${$.cash}元提现标准`);
  }else{
    // 提现API
    await withdraw_API();
    // console.log(result);
    if(result.errorCode!==200){
      console.log(`❌ 提现失败`);
    }else{
      $.withdraw = `提现￥[${$.cash}]成功,需要等待手动加速或自动7天后自动完成`
      console.log(`提现￥[${$.cash}]成功,需要等待手动加速或自动7天后自动完成`);
    }
  }
}

// 推送消息
async function sendMsg() {
  console.log(`本次脚本运行获得金币💰:${$.total}个\n${$.ExChangeMoney?"":$.ExChangeMoney}\n${$.withdraw}`);
  await notify.sendNotify(`万年历`,`本次脚本运行获得金币💰:${$.total}个\n${$.ExChangeMoney?"":$.ExChangeMoney}\n${$.withdraw}`);
}

// ==================API==================
// 初始化个人信息
async function init_info_API(){
  $.type = $.get
  await Request(`Api/User/GetExtInfo?${url}`)
}
// 邀请好友API
async function invite_new_API(){
  $.type = $.get
  await Request(`api/Coin_Activity/Complete?&code=Inviter_code&otherinfo=3odb62&${url}`)
}

// 获取任务列表API
async function task_list_API() {
  $.type = $.get
  await Request(`api/Coin_Activity/GetMissions?${url}`)
}

// 红包签到API
async function hb_sign_API() {
  $.type = $.post
  await Request(`api/Coin_Activity/CompleteHongBao?${url}`)
}

// 完成任务API
async function finish_task_API(mission){
  $.type = $.get
  await Request(`api/Coin_Activity/Complete?${url}&code=${mission}`)
}

// 金币💰兑换零钱红包🧧API
async function exchange_gold_to_money_API(){
  $.type = $.get
  await Request(`api/MemberExchangeConfig/CoinExChangeCash?${url}&ExChangeCoin=${$.ExChangeCoin}`)
}

// 提现记录API
async function draw_log_API(){
  $.type = $.get
  await Request(`Api/user/DrawLog?${url}&pageindex=1&pagesize=100`)
}

// 提现API
async function withdraw_API(){
  $.type = $.get
  await Request(`Api/User/WithDraw?${url}&cash=${$.cash}&cashcode=2`)
}

// ==================API请求==================
function Request(ApiUrl, timeout = 1000){
  return new Promise(resolve => {
    setTimeout(() => {
      $.type(taskUrl(ApiUrl), (err, resp, data) => {
        try {
          if (err) {
            console.log('API查询请求失败 ‼️‼️')
            console.log(JSON.stringify(err));
            console.log(`ApiUrl:${ApiUrl}`)
          } else {
            result = JSON.parse(data);
          }} catch (e) {
            console.log(e)
        } finally {
          resolve(data);
        }
      })
    }, timeout)
  })
} 

// URL
function taskUrl(ApiUrl) {
  return {
    url: `${WNL_API_HOST}/${ApiUrl}`,
    headers: {
      'Host': 'r.51wnl-cq.com',
      'User-Agent': 'Calendar_New_UI/5.3.1 (iPhone; iOS 14.3; Scale/3.00)',
    }
  }
}

// pretty-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}