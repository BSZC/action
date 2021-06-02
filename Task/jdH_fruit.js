/*
 * @Author: Xin https://github.com/Xin-code 
 * @Date: 2021-03-22 15:19:50 
 * @Last Modified by: Xin 
 * @Last Modified time: 2021-06-02 16:55:12
 */

const $ = Env('京东到家-免费水果')

const JD_API_HOST = `https://daojia.jd.com/client?_jdrandom=${new Date().getTime()}`

const CookiesArr = []

const notify = $.isNode() ? require('./sendNotify') : '';

// 任务列表
const TaskArrList = []

// 循环获得水滴红包的次数
$.redPacketTime = 10

// 用于判断是否成熟
$.finish = false

$.message = ''

if ($.isNode()) {
  if (process.env.JDGH_XDZY_COOKIE && process.env.JDGH_XDZY_COOKIE.indexOf('#') > -1) {
    signcookie = process.env.JDGH_XDZY_COOKIE.split('#')
  } else {
    signcookie = process.env.JDGH_XDZY_COOKIE.split()
  }
  Object.keys(signcookie).forEach((item) => {
    if (signcookie[item]) {
      CookiesArr.push(signcookie[item])
    }
  })
}

!(async () => {
  for (let i = 0; i < CookiesArr.length; i++) {

    console.log(`········【帐号${i+1}】开始········`)
    
    cookie = CookiesArr[i]
    
    console.log(`🍉执行 -> 初始化果树`)
    await initFruit()
    
    console.log(`\n🍉执行 -> 查看任务列表`)
    await getTaskList()

    console.log(`\n🍉执行 -> 完成任务且领奖`);
    for (let i = 0; i < TaskArrList.length; i++) {
      Task = TaskArrList[i]
      console.log(`\n去做任务[${Task.taskId}]:`+await doFinishTask(Task));
      console.log(`领取奖励[${Task.taskId}]:`+await doDailyTaskAward(Task));
    }

    console.log(`\n🍉执行 -> 浇水`)
    // 15次才能完成浇水任务
    if($.totalWater>=150){
      for(let i=0; i<15; i++){
        await watering()
      }
    }else{
      console.log(`水滴容量为：【${$.totalWater}】g💧存储水滴···便于完成任务`)
    }
    
    console.log(`\n🥛执行 -> 收取水瓶`)
    await doWaterBottle()
    
    console.log(`\n🎡执行 -> 收取水车`)
    await doCollectWater()

    console.log(`\n💧执行 -> 领取红包`)
    await getRedPacket()
    for(let i = 0; i < $.redPacketTime ; i++){
      await getRedPacketAward()
    }
    
    if($.finish){
      console.log(`\n📧执行 -> 发送通知`)
      await sendMsg()
    }

    console.log(`········【帐号${i+1}】结束········`)
  }})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done())

// ==================功能模块==================
// 🌳初始化果树
async function initFruit() {
  // 初始化果树API
  await init_fruit_API()
  // console.log(result)
  if(result.code!=='0'){
    console.log(`❌ ${result.msg}`)
  }else{
    // 初始果树信息
    initFruitInfo = result.result.activityInfoResponse
    // console.log(initFruitInfo)
    console.log(`\n✅初始化果树信息成功\n活动ID：${initFruitInfo.activityId}\n当前种植：【${initFruitInfo.fruitName}】,当前阶段:【${initFruitInfo.stageName}】,还差【${initFruitInfo.curStageLeftProcess}%】${initFruitInfo.stageName==='成熟'?`可收获水果【${initFruitInfo.fruitName}】`:`还差【${initFruitInfo.curStageLeftProcess}%】次升级下一阶段`}`)
    // 初始化水壶信息
    initWaterInfo = result.result.userResponse
    // console.log(initWaterInfo)
    console.log(`\n✅初始化水壶信息成功\n当前水壶剩余水滴：【${initWaterInfo.waterBalance}g】💧`)
    $.totalWater = initWaterInfo.waterBalance
    
    if(initFruitInfo.stageName==='成熟'){
      $.finish = true
      // 当为成熟阶段的时候 每天推送消息
      $.message+=`当前种植：【${initFruitInfo.fruitName}】\n当前阶段:【${initFruitInfo.stageName}】\n还差【${initFruitInfo.curStageLeftProcess}%】可收获水果`
    }
  }
}

// 📕任务列表
async function getTaskList(){
  // 任务列表API
  await task_list_API()
  // console.log(result)
  if(result.code!=='0'){
    console.log(`❌ ${result.msg}`)
  }else{
    console.log(`获取任务列表: ✅ ${result.msg}`)
    // 任务列表 数组形式
    taskInfoList = result.result.taskInfoList
    // console.log(taskInfoList)
    taskInfoList.forEach((item)=>{
      // 每个任务
      // console.log(item)
      // 把 每个任务 内容都推送到TaskArrList内
      // 采用对象格式 [{},{},{},{}]
      let taskInfo = {
        'modelId':`${item.modelId}`,
        'taskId':`${item.taskId}`,
        'taskType':`${item.taskType}`,
        'plateCode':1,
      }
      // 去完成内容 推到数组内
      TaskArrList.push(taskInfo)
    })
    // console.log(TaskArrList)
  }
}

// 📕完成任务
async function doFinishTask(Task) {
  // 调用API
  await do_finish_task_API(Task)
  // console.log(result)
  if(result.code!=='0'){
    // 失败
    return result.msg
  }else{
    return `任务【${result.result.taskName}】 - 任务奖励【${result.result.awardValue}g】💧 - 待领取奖励💰`
  }
}

// 📕领取奖励
async function doDailyTaskAward(Task) {
  // 调用API
  await do_award_task_API(Task)
  // console.log(result)
  // 任务是否完成
  if(result.code!=='0'){
    // 未完成
    return result.msg
  }else{
    // 任务完成
    return `任务【${result.result.taskName}】-${result.result.buttonText}-获得【${result.result.awardValue}g】💧`
  }
}

// 💧浇水操作
async function watering() {
  // 浇水操作API
  await watering_API()
  // console.log(result)
  if(result.code!=='0'){
    // 浇水失败
    console.log(`❌ ${result.msg}`)
  }else{
    // 浇水成功
    WaterInfo = result.result
    console.log(`当前水滴数量：【${WaterInfo.curWaterBalance}】g💧`)
    console.log(`当前种植水果：【${WaterInfo.activityInfoResponse.fruitName}】 -> 阶段【${WaterInfo.activityInfoResponse.stageName}】，再浇【${WaterInfo.activityInfoResponse.curStageLeftProcess}】${WaterInfo.activityInfoResponse.stageName==='成熟'?`可收获水果【${WaterInfo.activityInfoResponse.fruitName}】`:`还差【${WaterInfo.activityInfoResponse.curStageLeftProcess}%】次升级下一阶段`}`)
  }
}

// 🥛水瓶
async function doWaterBottle(){
  // 水瓶API
  await do_water_bottle_API()
  // console.log(result)
  // 是否点击水瓶
  if(result.code!=='0'){
    // 未完成
    console.log(`${result.msg},用户今天已经领取过水瓶奖励···`)
  }else{
    // 任务完成
    console.log(`✅已成功收取水瓶奖励`)
  }
}

// 🎡水车
async function doCollectWater(){
  // 水车API
  await do_collect_water_API()
  // console.log(result)
  // 是否点击水车
  if(result.code!=='0'){
    // 未完成
    console.log(result.msg)
  }else{
    // 任务完成
    console.log(`当前用户水滴💧：【${result.result.userWaterBalance}g】\n容量限制：【${result.result.capacityLimit}g】💧\n总共收集到水滴💧:【${result.result.totalCollectWater}g】💧`)
  }
}

// 💧红包
async function getRedPacket(){
  // 红包API
  await get_red_packet_API()
  // console.log(result)
  if(result.code!=='0'){
    console.log(`❌ ${result.msg}`);
  }else{
    let redPacketInfo = result.result
    console.log(`当前红包进度[${redPacketInfo.curProgress}%/${redPacketInfo.targetProgress}%],\n还差[${redPacketInfo.restProgress}%]可领取红包🧧`);
  }
}

// 💧领取红包奖励
async function getRedPacketAward(){
  // 领取红包API
  await get_red_packet_award_API()
  if(result.code!=='0'){
    console.log(`❌ ${result.msg}`);
  }else{
    let redPacketInfo = result.result
    $.message+=`\n\n领取水滴红包${result.msg},获得水滴【${redPacketInfo.reward}g】💧，再有[${redPacketInfo.restProgress}%]可领取水滴红包`
    console.log(`领取水滴红包${result.msg},获得水滴【${redPacketInfo.reward}g】💧，再有[${redPacketInfo.restProgress}%]可领取水滴红包`);
  }
  
}

// 🗨发送信息
async function sendMsg() {
  await notify.sendNotify(`京东到家 - 免费水果`,`${$.message}`);
}

// ==================API==================
// 🌳初始化果树API
async function init_fruit_API() {
  let body = {"cityId":1213,"longitude":120.10793,"latitude":30.267014}
  await postRequestBody(`fruit/initFruit`, body)
}

// 📕任务列表API
async function task_list_API() {
  let body = {"modelId":"M10007","plateCode":1}
  await getRequestBody(`task/list`,body)
}

// 📕完成任务API
async function do_finish_task_API(Task) {
  await getRequestBody(`task/finished`, Task)
}

// 💧浇水操作API
async function watering_API() {
  await postRequestBody(`fruit/watering`,{})
}

// 📕领取奖励API
async function do_award_task_API(Task){
  await getRequestBody(`task/sendPrize`, Task)
}

// 🥛水瓶API
async function do_water_bottle_API(){
  await getRequestBody(`fruit/receiveWaterBottle`,{})
}

// 🎡水车API
async function do_collect_water_API(){
  await getRequestBody(`fruit/collectWater`,{})
}

// 💧红包API
async function get_red_packet_API(){
  await getRequestBody(`fruit/getWaterRedPackInfo`,{})
}

// 💧领取红包API 可刷水滴
async function get_red_packet_award_API(){
  await getRequestBody(`fruit/receiveWaterRedPack`,{})
}

// ==================请求==================
// post
function postRequestBody(ApiUrl, body, timeout = 1000){
  return new Promise(resolve => {
    setTimeout(() => {
      $.post(taskUrlBody(ApiUrl, body), (err, resp, data) => {
        try {
          if (err) {
            console.log('\nAPI查询请求失败 ‼️‼️')
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
function taskUrlBody(ApiUrl, params) {
  return {
    url: `${JD_API_HOST}`,
    // escape() 函数可对字符串进行编码
    body:`functionId=${ApiUrl}&isNeedDealError=true&method=POST&body=${escape(JSON.stringify(params))}`,
    headers: {
      'cookie':cookie,
      'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile`,
    }
  }
}

// get
function getRequestBody(ApiUrl, params = {}, timeout = 1000){
  return new Promise(resolve => {
    setTimeout(() => {
      $.get(taskUrl(ApiUrl, params), (err, resp, data) => {
        try {
          if (err) {
            console.log('\nAPI查询请求失败 ‼️‼️')
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
function taskUrl(ApiUrl, params = {}) {
  return {
    url: `${JD_API_HOST}&_funid_=${ApiUrl}&functionId=${ApiUrl}&isNeedDealError=true&body=${escape(JSON.stringify(params))}`,
    headers: {
      'cookie':cookie,
      'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile`,
    }
  }
}

// pretty-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}