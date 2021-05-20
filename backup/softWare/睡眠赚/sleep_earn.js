/*
 * @Author: Xin https://github.com/Xin-code 
 * @Date: 2021-03-31 15:53:53 
 * @Last Modified by: Xin 
 * @Last Modified time: 2021-05-20 19:54:24
 */

const $ = Env('睡眠赚')

const UidArr = []

const sportList = [
  `Roller_skating`,
  `Basketball`,
  `Run`,
  `Football`,
  `Riding`
]

const notify = $.isNode() ? require('../../../Task/sendNotify') : '';

const SLEEP_API_HOST = 'http://sleep.zouluzhuan.com'

$.go = false
$.turntableGo = true
$.isLogin = true
$.nickName = ''
$.WithdrawCash = 0

if ($.isNode()) {  
  if (process.env.SLEEP_EARN_UID && process.env.SLEEP_EARN_UID.indexOf('#') > -1) {
    signUid = process.env.SLEEP_EARN_UID.split('#');
  }else if(process.env.SLEEP_EARN_UID && process.env.SLEEP_EARN_UID.indexOf('#') > -1) {
    signUid = process.env.SLEEP_EARN_UID.split('\n');
  }else{
    signUid = [process.env.SLEEP_EARN_UID]
  }
  
  Object.keys(signUid).forEach((item) => {
    if (signUid[item]) {
      UidArr.push(signUid[item])
    }
  })
}

const nowTime = new Date().getTime()+8*60*60*1000
$.BJT = new Date(nowTime)
// 2021-04-01 09:18:14
// console.log(JSON.stringify(BJT).slice(1,20).replace('T',' '))
$.BJH = $.BJT.getUTCHours() // 当前小时

!(async () => {
  for(let i = 0 ; i < UidArr.length;i++){

    uid = UidArr[i]

    // 初始化个人信息
    console.log(`\n💎执行 -> 初始化个人信息`)
    await initUser()

    if($.isLogin){
      
      console.log(`==========================开始账号${i+1}【${$.nickName}】==========================`);

      // 提现
      console.log(`\n💴执行 -> 提现`)
      await Withdrew()

      await $.wait(2000)

      // 签到
      console.log(`\n💎执行 -> 签到`)
      await sign()
  
      // 初始化喝水信息
      console.log(`\n💎执行 -> 初始化喝水信息`)
      await initDrink($.nowimei)
      
      // 首页喝水
      // 10-17点
      console.log(`\n💎执行 -> 首页喝水`)
      console.log(`当前小时数:[${$.BJH}]`);
      if($.BJH>=10&&$.BJH<18){
        console.log(`执行喝水任务···`)
        for(let d = 0 ; d<8;d++){
          await drink(d+1,$.nowimei)
        }
      }else{
        console.log(`不在喝水区间内，跳出···`)
      }
      
      // 睡觉奖励
      console.log(`\n💎执行 -> 睡觉`)
      for(let p = 0 ; p<8;p++){
        await sleep(p,$.nowimei)
      }
    
      // 运动
      console.log(`\n🏃‍执行 -> 去运动`)
      for(let s = 0;s<sportList.length;s++){
        nowSport = sportList[s]
        await goMotion(nowSport,$.nowimei)
        console.log(`等待5s···`)
        await $.wait(5000)
      }

      // 运动-领取奖励
      console.log(`\n🏃执行 -> 运动领取奖励`)
      await sportAward()

    
      // 幸运大抽奖100次
      console.log(`\n💎执行 -> 幸运大抽奖`)
      await turntable($.nowimei)
      if($.turntableGo){
        for(let j = 0 ; j<100;j++){
          await turntable($.nowimei)
          console.log(`\n当前为第[${$.nowTime}]次:`)
        }
      }else{
        console.log(`当前已经抽完次数，跳出循环`)
      }
    
    
      // 幸运大抽奖开启宝箱
      console.log(`\n💎执行 -> 幸运大抽奖开启宝箱`)
      for(let o = 0;o<4;o++){
        let openBoxNum = [5,30,60,100]
        let nowopenBoxNum = openBoxNum[o]
        await openbox(nowopenBoxNum,$.nowimei)
      }
    
    
      // 每天获取的钻石💎
      console.log(`\n💎执行 -> 刷钻石`)
      for (let a = 0; a < 10000; a++) {
        await loop(a)
        await $.wait(1000) // 等待1s
        if($.go){
          return
        }
      }

  }else{
    console.log(`❌ 登录失败~，请重新获取Cookie`)
  }
    


    
  }
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())


// 初始化个人信息👨‍💻
async function initUser() {
  return new Promise((resolve) => {
    $.post(taskUrl(`api/member/index`),async(error, response, data) =>{
     try{
       if (error) {
         console.log(`${JSON.stringify(error)}`)
         console.log(`API请求失败，请检查网路重试`)
       } else {
         const result = JSON.parse(data)
         // 反馈信息
        //  console.log(result)
         if(result.code!==200){
           $.isLogin = false
           console.log(`❌ ${result.message}`)
         }else{
           $.nickName = result.data.user.nickname
           $.nowimei = result.data.user.imei
           // 50000钻石≈1块钱
           console.log(`用户${$.nickName}初始化成功\n今日获得💎[${result.data.today_coin}]个,今日获得💴【${result.data.today_coin/50000}】元`)
           $.Initmessage = `用户${$.nickName}\n获得💎[${result.data.today_coin}]个\n获得💴【${result.data.today_coin/50000}】元`
         }
       }}catch(e) {
           console.log(e)
         } finally {
         resolve();
       } 
     })
    })
}

// 提现💴
async function Withdrew() {
  return new Promise((resolve) => {
    $.post(taskUrl(`api/withdraws/index`),async(error, response, data) =>{
     try{
       if (error) {
         console.log(`${JSON.stringify(error)}`)
         console.log(`API请求失败，请检查网路重试`)
       } else {
         const result = JSON.parse(data)
         // 反馈信息
         // console.log(result)
         if(result.code!==200){
           console.log(`❌ ${result.message}`)
         }else{
          //  console.log(result)
           $.WithdrawCash = (result.data.canCash-0).toFixed()
           console.log(`当前可以提现：【￥${$.WithdrawCash}】`)
           result.data.cashes.forEach((item)=>{
            //  console.log(item)
             if($.WithdrawCash>=item){
               console.log(`当前提现的金额为:【￥${item}】`)
               ConfirmWithdrew(item)
             }else{
               console.log(`❌ 未达到提现金额，稍后重试~`)
             }
           })

        }}}catch(e) {
           console.log(e)
         } finally {
         resolve();
       } 
     })
    })
}

// 提现确认💴
async function ConfirmWithdrew(nowCash) {
  return new Promise((resolve) => {
    let body = `amount=${nowCash}&channel=1&device=ios&imei=018e6c84ed05501906d4457d9d3b60fbf2ceadcd&source=ios&uid=${uid}&version=1.0.7`
    $.post(drinkURL(`api/withdraws/confirm`,body),async(error, response, data) =>{
     try{
       if (error) {
         console.log(`${JSON.stringify(error)}`)
         console.log(`API请求失败，请检查网路重试`)
       } else {
         const result = JSON.parse(data)
         // 反馈信息
         // console.log(result)
         console.log(`\n💴执行 -> 提现确认`);
         if(result.code!==200){
           console.log(`❌ ${result.message}`)
         }else{
           console.log(`✅提现成功：${result.message}`)
           $.Withdrawmessage=`✅提现：【${nowCash}】,\n${result.message}`
           
           //推送消息
           await sendMsg()
         }
       }}catch(e) {
           console.log(e)
         } finally {
         resolve();
       } 
     })
    })
}


// 签到 ✅
async function sign(){
  return new Promise((resolve) => {
    $.post(taskUrl(`api/member/signCoin`),async(error, response, data) =>{
     try{
       if (error) {
         console.log(`${JSON.stringify(error)}`)
         console.log(`API请求失败，请检查网路重试`)
       } else {
         const result = JSON.parse(data)
         // 反馈信息
         // console.log(result)
         if(result.code!==200){
           console.log(`签到失败！`)
         }else{
           console.log((result.data.is_signed===1?'❌ 重复签到':`✅ 签到成功`)+`,获得:【${result.data.setting[result.data.next_days-2]}个】钻石💎\n总签到【${result.data.signCount}】天,下次签到是：第${result.data.next_days}天`)
         }
       }}catch(e) {
           console.log(e)
         } finally {
         resolve();
       } 
     })
    })
 }

// 初始化喝水信息 ✅
async function initDrink() {
  return new Promise((resolve) => {
    let body = `device=ios&imei=${$.nowimei}&source=ios&uid=${uid}&version=1.0.7`
    $.post(drinkURL(`api/home/index`,body),async(error, response, data) =>{
     try{
       if (error) {
         console.log(`${JSON.stringify(error)}`)
         console.log(`API请求失败，请检查网路重试`)
       } else {
         const result = JSON.parse(data)
         // 反馈信息
        //  console.log(result)
         if(result.code!==200){
           console.log(`❌ ${result.message}`)
         }else{
           const CupList = result.data.cupslist
           CupList.forEach((item)=>{
             console.log(`当前第【${item.cup_id}】杯,${item.cup_title}`)
           })
         }
        }}catch(e) {
           console.log(e)
         } finally {
         resolve();
       } 
     })
    })
}

// 喝水 ✅
async function drink(d) {
  return new Promise((resolve) => {
    let body = `coin=29&cupid=${d}&device=ios&double=1&imei=${$.nowimei}&source=ios&uid=${uid}&version=1.0.7`
    $.post(drinkURL(`api/home/drink`,body),async(error, response, data) =>{
     try{
       if (error) {
         console.log(`${JSON.stringify(error)}`)
         console.log(`API请求失败，请检查网路重试`)
       } else {
         const result = JSON.parse(data)
         // 反馈信息
         console.log(`喝水尝试领取[${d}]次奖励`)
         console.log(result)
         console.log(`等待5s···`)
         await $.wait(5000)
        }}catch(e) {
           console.log(e)
         } finally {
         resolve();
       } 
     })
    })
}

// 睡觉 ✅ 
// 传递coin=999 double=1
async function sleep(p) {
  return new Promise((resolve) => {
    let body = `bubbleid=${p}&coin=999&device=ios&double=1&imei=${$.nowimei}=ios&type=1&uid=${uid}&version=1.0.7`
    $.post(drinkURL(`api/home/getsleepcoin`,body),async(error, response, data) =>{
     try{
       if (error) {
         console.log(`${JSON.stringify(error)}`)
         console.log(`API请求失败，请检查网路重试`)
       } else {
         const result = JSON.parse(data)
         // 反馈信息
         console.log(result)
         if(result.code!==200){
           console.log(`❌ ${result.message}`)
         }else{
           console.log(`获得钻石💎【`+999*2+`】个`)
           console.log(`等待5s···`)
           await $.wait(5000)
         }

        }}catch(e) {
           console.log(e)
         } finally {
         resolve();
       } 
     })
    })
}

// 🏃‍运动 ✅
async function goMotion(sport) {
  return new Promise((resolve) => {
    $.post(NobodytaskUrl(`api/motion/goMotion?imei=${$.nowimei}&Identification=${sport}`,$.nowimei),async(error, response, data) =>{
     try{
       if (error) {
         console.log(`${JSON.stringify(error)}`)
         console.log(`API请求失败，请检查网路重试`)
       } else {
         const result = JSON.parse(data)
         // 反馈信息
         console.log(result)
         if(result.code!==200){
           console.log(`❌ ${result.message}`)
         }else{
            console.log(`去运动【${sport}】${result.message}`)
            console.log(`等待${result.data.motion_time}秒后，方可领取【${result.data.coin_numbers}💎】`)
            console.log(`等待运动完成···`)
            await $.wait(result.data.motion_time*1000)
         }
         console.log(`等待5s···`)
         await $.wait(5000)
         console.log(`去收取奖励···`)
         await goMotionAward(sport,$.nowimei)
         
        }}catch(e) {
           console.log(e)
         } finally {
         resolve();
       } 
     })
    })
}

// 运动收取奖励 ✅
async function goMotionAward(sport) {
  return new Promise((resolve) => {
    let body = `Identification=${sport}`
    $.post(bodytaskUrl(`api/motion/getMotionReward?imei=${$.nowimei}`,body,$.nowimei),async(error, response, data) =>{
     try{
       if (error) {
         console.log(`${JSON.stringify(error)}`)
         console.log(`API请求失败，请检查网路重试`)
       } else {
         const result = JSON.parse(data)
         // 反馈信息
         console.log(result)
         if(result.code!==200){
           console.log(`❌ ${result.message}`)
         }else{
           console.log(`【${sport}】${result.message},获得:【${result.data.coin_numbers}💎】,获得能量:【${result.data.energy}】`)
         }
         
        }}catch(e) {
           console.log(e)
         } finally {
         resolve();
       } 
     })
    })
}
/*
{
  "message" : "领取成功",
  "data" : {
    "coin_numbers" : "30",
    "energy" : "50"
  },
  "code" : "200"
}
*/

// 🏃‍运动-领取奖励 ✅
async function sportAward() {
  return new Promise((resolve) => {
    let body = `Identification=other`
    $.post(bodytaskUrl(`api/motion/getMotionReward?imei=${$.nowimei}`,body),async(error, response, data) =>{
     try{
       if (error) {
         console.log(`${JSON.stringify(error)}`)
         console.log(`API请求失败，请检查网路重试`)
       } else {
         const result = JSON.parse(data)
         // 反馈信息
         console.log(result)
         if(result.code!==200){
           console.log(`❌ ${result.message}`)
         }else{
           console.log(`【运动-领取奖励】${result.message},获得:【${result.data.coin_numbers}💎】`)
         }
         
        }}catch(e) {
           console.log(e)
         } finally {
         resolve();
       } 
     })
    })
}

/*
{
  "code": "200",
  "message": "领取成功",
  "data": {
    "coin_numbers": "57",
    "energy": "0"
  }
}
*/



// 🎡幸运大转盘 ✅
async function turntable(){
  return new Promise((resolve) => {
    $.get(NobodytaskUrl(`api/turntable/turntableCoin?imei=${$.nowimei}&source=ios&device=ios`,$.nowimei),async(error, response, data) =>{
     try{
       if (error) {
         console.log(`${JSON.stringify(error)}`)
         console.log(`API请求失败，请检查网路重试`)
       } else {
         if(data.match(`2001`)){
           $.turntableGo = false
         }else{
         const result = JSON.parse(data)
         // 反馈信息
        //  console.log(result)
        if(result.code!==200){
          console.log(`❌ 执行大转盘错误！`)
        }else{
          $.nowTime = (result.data.hasNum)-0
          if(result.data.coin!==0){
            console.log(`获得:【${result.data.coin}个💎】`)
          }else{
            console.log(`获得空气~`)
          }
        }
        console.log(`等待10s···`)
        await $.wait(10000) // 等待10s
      }
        }}catch(e) {
           console.log(e)
         } finally {
         resolve();
       } 
     })
    })
 }

 // 开启宝箱 ✅
async function openbox(num) {
  return new Promise((resolve) => {
    let body = `source=ios&device=ios&num=${num}`
    $.post(bodytaskUrl(`api/turntable/chestcoin?imei=${$.nowimei}&jsoncallback=`,body,$.nowimei),async(error, response, data) =>{
     try{
       if (error) {
         console.log(`${JSON.stringify(error)}`)
         console.log(`API请求失败，请检查网路重试`)
       } else {
         const result = JSON.parse(data.slice(1,data.length-1))
         // 反馈信息
        //  console.log(result)
        if(result.code!==200){
          console.log(`❌ ${result.message}`)
        }else{
          console.log(`开第【${num}】个宝箱本次获得钻石💎:【${result.data}】个`)
        }
        }}catch(e) {
           console.log(e)
         } finally {
         resolve();
       } 
     })
    })
}
/*
{
  "code":200,
  "message":"Request Success.",
  "data":5
}
 */

// 刷钻石💎 ✅ 有上限
async function loop(a){
 return new Promise((resolve) => {
   $.post(taskUrl(`api/member/randCoin`),async(error, response, data) =>{
    try{
      if (error) {
        console.log(`${JSON.stringify(error)}`)
        console.log(`API请求失败，请检查网路重试`)
      } else {
        const result = JSON.parse(data)
        // 反馈信息
        // console.log(result)
        if(result.code===200){
          // 本次
          console.log(`第[${a+1}]次循环，本次钻石+10`)
        }else{
          console.log(result.message)
          console.log(`结束刷钻石`)
          $.go = true
        }
      }}catch(e) {
          console.log(e)
        } finally {
        resolve();
      } 
    })
   })
}

// 发送通知
async function sendMsg() {
  await notify.sendNotify(`睡眠赚`,`${$.Initmessage}\n${$.Withdrawmessage}`);
}



// URL
function taskUrl(activity) {
  return {
    url: `${SLEEP_API_HOST}/${activity}`,
    body:`device=ios&imei=${$.imei}&source=ios&uid=${uid}&version=1.0.7`,
    headers: {
      "Accept": "*/*",
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": "zh-Hans-CN;q=1",
      "Connection": "close",
      'Content-Length': '110',
      "Content-Type": "application/x-www-form-urlencoded",
      'Host': 'sleep.zouluzhuan.com',
      'User-Agent': 'SMMon/1.0.7 (iPhone; iOS 14.3; Scale/3.00)',
    }
  }
}

function NobodytaskUrl(activity) {
  return {
    url: `${SLEEP_API_HOST}/${activity}`,
    headers: {
      "Accept": "*/*",
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": "zh-Hans-CN;q=1",
      "Connection": "keep-alive",
      'Content-Length': '110',
      "Content-Type": "application/x-www-form-urlencoded",
      'Host': 'sleep.zouluzhuan.com',
      'Referer':`http://sleep.zouluzhuan.com/api/turntable/index?imei=${$.nowimei}&version=1.0.7&device=ios&source=ios`,
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
    }
  }
}

function bodytaskUrl(activity,body) {
  return {
    url: `${SLEEP_API_HOST}/${activity}`,
    body:body,
    headers: {
      "Accept": "*/*",
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": "zh-Hans-CN;q=1",
      "Connection": "keep-alive",
      'Content-Length': '110',
      "Content-Type": "application/x-www-form-urlencoded",
      'Host': 'sleep.zouluzhuan.com',
      'Referer':`http://sleep.zouluzhuan.com/api/turntable/index?imei=${$.nowimei}&version=1.0.7&device=ios&source=ios`,
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
    }
  }
}

function drinkURL(activity,body) {
  return {
    url: `${SLEEP_API_HOST}/${activity}`,
    body:body,
    headers: {
      "Accept": "*/*",
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": "zh-Hans-CN;q=1",
      "Connection": "keep-alive",
      "Content-Type": "application/x-www-form-urlencoded",
      'Host': 'sleep.zouluzhuan.com',
      'User-Agent': 'SMMon/1.0.7 (iPhone; iOS 14.3; Scale/3.00)',
    }
  }
}

// pretty-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
