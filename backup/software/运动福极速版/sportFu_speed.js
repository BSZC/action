/*
 * @Author: Xin https://github.com/Xin-code 
 * @Date: 2021-04-02 11:15:20 
 * @Last Modified by: Xin 
 * @Last Modified time: 2021-05-30 14:37:51
 */

const $ = Env('运动福极速版')

const notify = $.isNode() ? require('../../../Task/sendNotify') : '';

$.message = ''

const SPORT_FU_API_HOST = 'https://api.yundongfu.mobi'

const TokenArr = []

if ($.isNode()) {
  if (process.env.SPORTFU_SPEED_TOKEN && process.env.SPORTFU_SPEED_TOKEN.indexOf('#') > -1) {
    signToken = process.env.SPORTFU_SPEED_TOKEN.split('#');
  }else if(process.env.SPORTFU_SPEED_TOKEN && process.env.SPORTFU_SPEED_TOKEN.indexOf('#') > -1) {
    signToken = process.env.SPORTFU_SPEED_TOKEN.split('\n');
  }else{
    signToken = [process.env.SPORTFU_SPEED_TOKEN]
  }

  Object.keys(signToken).forEach((item) => {
    if (signToken[item]) {
      TokenArr.push(signToken[item])
    }
  })
}

!(async () => {
  for (let i = 0; i < TokenArr.length; i++) {
    token = TokenArr[i]

    console.log(`········【帐号${i+1}】开始········`)

    console.log(`👨‍💻执行 -> 初始化用户信息`)
    await InitUserInfo()

    console.log(`\n💰执行 -> 获取金币信息`)
    await goldInfo()
    
    console.log(`\n📝执行 -> 获取任务信息`)
    await getTaskList()

    console.log(`\n📝执行 -> 日常签到`)
    for(let s = 2 ;s >= 1;s--){
      await sign(s)
    }

    console.log(`\n💰执行 -> 随机奖励`)
    for( a = 2 ; a >= 1; a--){
      await RandomAward(a)
    }

    console.log(`\n📺执行 -> 看福利视频赚金币`)
    for(let i = 0 ; i < 6 ; i++){
      await TV_Earn()
    }

    console.log(`\n🥚执行 -> 砸鸡蛋`)
    await Egg()

    console.log(`\n🐟执行 -> 喂养锦鲤`)
    await Fish()

    console.log(`\n🌳执行 -> 摇钱树`)
    await TreeRandom()
    await TreeDouble()
    await TreeGoldInfo()
    

    //推送消息
    // await sendMsg()

    console.log(`········【帐号${i+1}】结束········`)

  }
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())

    
// 初始化用户信息👨‍💻
async function InitUserInfo() {
  // 调用API
  await InitUserInfo_API()
  
  const result = JSON.parse($.InitUserInfo_API_Result)
  // console.log(result)
  console.log(`\n✅ 初始化用户信息完成~`)
  $.alias = result.data.alias
  console.log(`当前用户[${result.data.user.nick}]拥有:[${result.data.goldAccount.goldNum}]💰\n当前用户的邀请码为:${result.data.user.inviteCode}`)
}

// 获取金币信息💰
async function goldInfo() {
  // 调用API
  await goldInfo_API()
  
  const result = JSON.parse($.goldInfo_API_Result)
  // console.log(result)
  console.log(`当前账号金币【${result.data.goldNum}】💰`)
}

// 获取任务信息📝
async function getTaskList(){
  // 调用API
  await getTaskList_API()
  
  const result = JSON.parse($.getTaskList_API_Result)
  //  console.log(result)
  const TaskListInfo = result.data.taskDetails
  console.log(`获取任务成功~`)
  TaskListInfo.forEach((item)=>{
    console.log(`任务【${item.goldDailyTaskSetting.name}】，可以获得💰【${item.goldDailyTaskSetting.goldNum}】个`)
  })
}

// 日常签到📝
async function sign(index){
  // 调用API
  await sign_API(index)
  
  const result = JSON.parse($.sign_API_Result)
  // console.log(result)
  if(index===2){
    console.log(`📝每日签到：【${result.resp.msg}】`)
  }else{
    console.log(`📝领取双倍日常签到奖励:【${result.resp.msg}】`)
  }
}

 // 随机奖励💰
 async function RandomAward(index) {
   // 调用API
   await RandomAward_API(index)
   
   const result = JSON.parse($.RandomAward_API_Result)
   // console.log(result)
   if(result.resp.code===310){
     console.log(`❌ ${result.resp.msg},跳过···`)
     return
 }
}

// 看福利视频赚金币📺
async function TV_Earn() {
  // 调用API
  await TV_Earn_API()

  const result = JSON.parse($.TV_Earn_API_Result)
  // console.log(result)
  if(result.resp.code!==304){
    console.log(`✅ ${result.resp.msg} 获得💰:[50]`)
  }else{
    console.log(`❌ ${result.resp.msg}`)
  }
}

// 砸鸡蛋🥚
async function Egg(){
  // 调用API
  await Egg_API()

  const result = JSON.parse($.Egg_API_Result)
  // console.log(result)
  if(result.resp.code!==502){
    console.log(`✅ 砸鸡蛋养锦鲤获得💰:[50]`)
  }else{
    console.log(`❌ ${result.resp.msg}`)
  }
}

// 喂养锦鲤🐟
async function Fish() {
  // 调用API
  await Fish_API()

  const result = JSON.parse($.Fish_API_Result)
  // console.log(result)
  if(result.resp.code!==503){
    console.log(`✅ ${result.resp.msg} 喂养成功`)
  }else{
    console.log(`❌ ${result.resp.msg}`)
  }
}

// 100肥料奖励🌳
async function TreeRandom() {
  // 调用API
  await TreeRandom_API()

  const result = JSON.parse($.TreeRandom_API_Result)
  // console.log(result)
  console.log(`✅ ${result.resp.msg} 获得奖励🌳:[100]肥料`)
}

// 双倍助力奖励🌳
async function TreeDouble(){
  // 调用API
  await TreeDouble_API()

  const result = JSON.parse($.TreeRandom_API_Result)
  // console.log(result)
  console.log(`✅ ${result.resp.msg} 获得双倍助力奖励🌳`)
}

// 获得摇钱树上福袋信息
async function TreeGoldInfo() {
  // 调用API
  await TreeGoldInfo_API()

  const result = JSON.parse($.TreeGoldInfo_API_Result)
  console.log(`开始执行领取[福袋]`)
  if(result.resp!==303){
    console.log(`❌ ${result.resp.msg}`)
  }else{
    console.log(`获得领取ID:${result.data.id}`)
    await TreeGoldReward(result.data.id)
  }
}

// 领取摇钱树上福袋的奖励
async function TreeGoldReward(id) {
  // 调用API
  await TreeGoldReward_API(id)

  const result = JSON.parse($.TreeGoldInfo_API_Result)
  // console.log(result)
  console.log(`✅ ${result.resp.msg} 获得福袋奖励💰`)
}


async function sendMsg() {
  await notify.sendNotify(`xxxx`,`${$.message}`);
}

// ==================API==================
// 初始化用户信息👨‍💻API
async function InitUserInfo_API() {
  $.InitUserInfo_API_Result = await getRequest(`v1/user/view`)
}

// 获取金币信息💰API
async function goldInfo_API() {
  $.goldInfo_API_Result = await getRequest(`v1/gold/account?alias=${$.alias}`)
}

// 获取任务信息📝API
async function getTaskList_API() {
  $.getTaskList_API_Result = await getRequest(`v1/gold/dailyTask?deviceType=2`)
}

// 日常签到📝API
async function sign_API(index) {
  $.sign_API_Result = await getRequest(`v1/gold/sign?goldSignSettingId=1&hasDouble=${index}`)
}

// 随机奖励💰API
// goldNum 金币数量30个
// doubleType
// hasDouble 是否是双倍 1为双倍 2为不是双倍(先领取不是双倍的2，在领取为双倍的1)
async function RandomAward_API(index) {
  $.RandomAward_API_Result = await postNoBodyRequest(`v1/gold/random?doubleType=2&goldNum=30&hasDouble=${index}`)
}

// 看福利视频赚金币📺API
async function TV_Earn_API() {
  $.TV_Earn_API_Result = await postNoBodyRequest(`v1/gold/daily?goldDailyTaskSettingId=2`)
}

// 砸鸡蛋🥚API
async function Egg_API() {
  $.Egg_API_Result = await postNoBodyRequest(`v1/chick/egg/smash`)
}

// 喂养锦鲤🐟API
async function Fish_API() {
  $.Fish_API_Result = await postNoBodyRequest(`v1/chick/feed`)
}

// 100肥料奖励🌳API
async function TreeRandom_API() {
  $.TreeRandom_API_Result = await postNoBodyRequest(`v1/gold/kettle/random?waterNum=100`)
}

// 双倍助力奖励🌳API
async function TreeDouble_API() {
  $.TreeDouble_API_Result = await postNoBodyRequest(`v1/gold/kettle/set/double`)
}

// 获得摇钱树上福袋信息API
async function TreeGoldInfo_API() {
  $.TreeGoldInfo_API_Result = await postNoBodyRequest(`v1/gold/duration?doubleType=2&goldDurationId=1&hasDouble=2`)
}

// 领取摇钱树上福袋的奖励API
async function TreeGoldReward_API(id) {
  $.TreeGoldReward_API_Result = await postNoBodyRequest(`v1/gold/duration?doubleOperateId=${id}&doubleType=2&goldDurationId=1&hasDouble=1`)
}



// Get请求
function getRequest(function_id, timeout = 1000){
  return new Promise(resolve => {
    setTimeout(() => {
      $.get(gettaskUrl(function_id), (err, resp, data) => {
        try {
          if (err) {
            console.log('\nAPI查询请求失败 ‼️‼️')
            console.log(JSON.stringify(err));
            console.log(`function_id:${function_id}`)
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

// Post请求
function postNoBodyRequest(function_id,timeout = 1000){
  return new Promise(resolve => {
    setTimeout(() => {
      $.post(postNoBodyTaskUrl(function_id), (err, resp, data) => {
        try {
          if (err) {
            console.log('\nAPI查询请求失败 ‼️‼️')
            console.log(JSON.stringify(err));
            console.log(`function_id:${function_id}`)
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
function gettaskUrl(activity) {
  return {
    url: `${SPORT_FU_API_HOST}/${activity}`,
    headers: {
      "Accept": "*/*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "zh-cn",
      "Connection": "keep-alive",
      "Content-Type": "application/json",
      'Host': 'api.yundongfu.mobi',
      'token': token,
    }
  }
}

function postNoBodyTaskUrl(activity) {
  return {
    url: `${SPORT_FU_API_HOST}/${activity}`,
    headers: {
      "Accept": "*/*",
      "Accept-Encoding": "gzip;q=1.0, compress;q=0.5",
      "Accept-Language": "zh-Hans-CN;q=1.0",
      "Connection": "keep-alive",
      "Content-Type": "application/json",
      'Host': 'api.yundongfu.mobi',
      'token': token,
      'deviceType':2,
      'version': '1.1.0',
    }
  }
}

// pretty-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}