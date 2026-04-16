/* ── Nav Widgets: Makkah Time · Weather · Next Prayer ── */
(function(){

  /* ── 1. Makkah Time — live clock ── */
  function updateMakkahTime(){
    var el = document.getElementById('makkah-time');
    if(!el) return;
    el.textContent = new Date().toLocaleTimeString('en-US',{
      timeZone:'Asia/Riyadh', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:true
    });
  }
  updateMakkahTime();
  setInterval(updateMakkahTime, 1000);

  /* ── 2. Weather via Open-Meteo (free, no key) ── */
  var WX = {0:'☀',1:'🌤',2:'⛅',3:'☁',45:'🌫',48:'🌫',
    51:'🌦',53:'🌦',55:'🌧',61:'🌧',63:'🌧',65:'🌧',
    71:'🌨',73:'🌨',75:'🌨',80:'🌦',81:'🌧',82:'⛈',
    95:'⛈',96:'⛈',99:'⛈'};

  function fetchWeather(lat,lon){
    fetch('https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lon+
          '&current_weather=true&temperature_unit=celsius')
      .then(function(r){return r.json();})
      .then(function(d){
        var t=Math.round(d.current_weather.temperature);
        var icon=WX[d.current_weather.weathercode]||'🌡';
        var el=document.getElementById('weather-val');
        if(el) el.innerHTML=icon+' <strong>'+t+'°C</strong>';
      })
      .catch(function(){
        var el=document.getElementById('weather-val');
        if(el) el.textContent='— °C';
      });
  }

  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
      function(p){ fetchWeather(p.coords.latitude,p.coords.longitude); },
      function(){ fetchWeather(21.3891,39.8579); },
      {timeout:8000}
    );
  } else { fetchWeather(21.3891,39.8579); }

  /* ── 3. Next Prayer via Aladhan (Umm al-Qura, method=4) ── */
  var PRAYERS=['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'];
  function toMins(s){var m=s.match(/(\d+):(\d+)/);return m?parseInt(m[1])*60+parseInt(m[2]):0;}

  function fetchNextPrayer(lat,lon){
    var d=new Date();
    fetch('https://api.aladhan.com/v1/timings/'+
      d.getDate()+'-'+(d.getMonth()+1)+'-'+d.getFullYear()+
      '?latitude='+lat+'&longitude='+lon+'&method=4')
      .then(function(r){return r.json();})
      .then(function(data){
        var t=data.data.timings;
        var now=new Date(), nowM=now.getHours()*60+now.getMinutes();
        var next=null,nextTime=null;
        for(var i=0;i<PRAYERS.length;i++){
          if(t[PRAYERS[i]] && toMins(t[PRAYERS[i]])>nowM){
            next=PRAYERS[i]; nextTime=t[PRAYERS[i]].substring(0,5); break;
          }
        }
        if(!next){next='Fajr'; nextTime=t['Fajr'].substring(0,5);}
        var n=document.getElementById('prayer-name');
        var pt=document.getElementById('prayer-time');
        if(n) n.textContent=next;
        if(pt){
          var h=parseInt(nextTime),min=nextTime.split(':')[1],ampm=h>=12?'pm':'am';
          h=h%12||12;
          pt.textContent=h+':'+min+' '+ampm;
        }
      })
      .catch(function(){
        var n=document.getElementById('prayer-name');
        if(n) n.textContent='—';
      });
  }

  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
      function(p){fetchNextPrayer(p.coords.latitude,p.coords.longitude);},
      function(){fetchNextPrayer(21.3891,39.8579);},
      {timeout:8000}
    );
  } else { fetchNextPrayer(21.3891,39.8579); }

})();
