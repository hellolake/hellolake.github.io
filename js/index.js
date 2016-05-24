lake.listen(window,"load",function () {
    var touchable = "ontouchstart" in document,doc_width,doc_height,canplay = false,starting = false,playing = false,showing = false,loading=false,content_i = 0,
        video_container = lake.select(".video"),
        video_wrap = video_container.firstElementChild,
        video = video_wrap.firstElementChild;

    console.log([video]);
    console.log(navigator.userAgent);
    console.log(video.canPlayType('video/webm; codecs="vp8.0, vorbis"'));

    if(parseInt(navigator.userAgent.replace(/.+Safari\/(\d+).+/,"$1"))<535){
        video_wrap.style.position = "relative"
    }
    lake.listen(window,"resize",function () {
        resize();
        nav_resize();
        set_content_h(content_i);
    });
    function set_doc() {
        doc_width = document.documentElement.clientWidth;
        doc_height = document.documentElement.clientHeight;
    }
    function playsize() {
        var v_height = video_container.clientWidth/16*9,
            c_height;
        if(doc_height < v_height){
            c_height = doc_height
        }else {
            c_height = v_height
        }
        video_container.style.height = c_height+"px";
    }
    function pausesize() {
        var v_height;
        if(doc_width > doc_height){
            v_height = doc_width/16*9*0.618
        }else {
            v_height = doc_width/16*9
        }
        video_container.style.height = v_height + "px";
    }
    function resize() {
        set_doc();
        if(playing)  playsize();
        else pausesize();
        setTimeout(center,100);
    }
    resize();

    function prefix(style) {
        var cap = style.replace(/(\w)/,function(s){return s.toUpperCase()});
        return style in video_wrap.style ? style : "webkit"+cap in video_wrap.style ? "webkit"+cap : "moz"+cap in video_wrap.style ? "moz"+cap : "ms"+cap in video_wrap.style ? "ms"+cap : "o"+cap in video_wrap.style ? "o"+cap : style;
    }

    var transform = prefix("transform"),
        leave = "onmouseleave" in video_container ? "mouseleave" : "mouseout",
        enter = "onmouseenter" in video_container ? "mouseenter" : "mouseover",
        tranx = 0,trany = 0,pozing;

    function pan(e) {
        var x = e.clientX,
            y = e.clientY,
            c_width = video_container.clientWidth,
            c_height = video_container.clientHeight,
            v_width = video.clientWidth,
            v_height = video.clientHeight,
            o_width = v_width-c_width,
            o_height = v_height-c_height;
        tranx = -(x - c_width/2)/c_width * o_width;
        trany = -(y - c_height/2)/c_height * o_height;
    }
    function setpoz() {
        video_wrap.style[transform] = "translate3D("+tranx+"px,"+trany+"px,0)";
    }
    function center() {
        tranx = 0;trany = 0;
        video_wrap.style[transform] = "translate3D(0,0,0)";
    }

    var addclass,removeclass;
    if("classList" in video_container){
        addclass =function (ele,cls) {
            ele.classList.add(cls);
        };
        removeclass = function (ele,cls) {
            ele.classList.remove(cls);
        }
    }else {
        addclass = function (ele,cls) {
            ele.className.search(new RegExp("\\b"+cls+"\\b"))<0 &&( ele.className = ele.className + " " + cls )
        };
        removeclass = function (ele,cls) {
            ele.className.search(new RegExp("\\b"+cls+"\\b"))>-1 &&( ele.className = ele.className.replace(new RegExp("\\b("+cls+")\\b","g"),"").trim() )
        };
    }

    var img2 = document.createElement("img");
    addclass(img2,"two");
    img2.setAttribute("src","img/A_Chinese_Selection2.jpg");
    video_wrap.appendChild(img2);

    function loadingprevent(e) {
        if(playing&&loading){
            e.preventDefault();
            e.stopPropagation();
        }
    }

    if(!touchable){
        lake.listen(video_container,"mousemove",pan);
        lake.listen(video_container,enter,function (e) {
            !pozing&&(pozing = setInterval(setpoz,100))
        });
        lake.listen(video_container,leave,function (e) {
            pozing&&clearInterval(pozing);
            pozing = null;
            center();
        });
        leave == "mouseout" && lake.listen(video_container.children,leave,function (e) {
            e.stopPropagation();
        });
        lake.listen(".radiate",enter,function (e) {
            addclass(this,"in");
            addclass(this,"on");
        });
        lake.listen(".radiate",leave,function (e) {
            removeclass(this,"in");
            removeclass(this,"on");
        });
        lake.listen(".play a","click",loadingprevent,true);
        lake.listen(".play em","click",function (e) {
            play();
        });
        var timeout,hover = false;
        lake.listen(video_container,"click",function (e) {
            timeout&&clearTimeout(timeout);
            if(playing){
                show();
                hover = true;
                timeout = setTimeout(function(){playing&&!loading&&hide();hover = false;},5000)
            }
        });
        lake.listen(".control",enter,function (e) {
            hover = true;
            timeout&&clearTimeout(timeout);
        });
        lake.listen(".control",leave,function (e) {
            playing&&(timeout = setTimeout(function(){playing&&!loading&&hide();hover = false;},5000))
        });
    }else {
        lake.listen(document.body,"touchstart",function(){});
        lake.listen(".play a","touchstart",loadingprevent,true);
        lake.listen(".play a","touchend",loadingprevent,true);
        lake.listen(".play em,.play i,.play a","touchstart",function (e) {
            removeclass(this,"fadeout");
            addclass(this,"on");
        });
        lake.listen(".play em,.play i,.play a","touchend",function (e) {
            addclass(this,"fadeout");
            removeclass(this,"on");
        });
        lake.listen(".play em","touchend",function (e) {
            play();
        });
        lake.listen(video_container,"touchend",function (e) {
            timeout&&clearTimeout(timeout);
            if(playing){
                show();
                timeout = setTimeout(function(){playing&&!loading&&hide();},5000)
            }
        });

    }

    function play() {
        if(!canplay && (video.currentSrc).match(/\.webm/i)){
            video.setAttribute("src","video/A_Chinese_Selection.mp4");
        }
        if(!starting){
            starting = true;
            addclass(video_container,"starting");
        }
        if(playing) video.pause();
        else {video.play();addprocess();}
    }
    function show() {
        showing = true;
        addclass(video_container,"showing");
    }
    function hide() {
        showing = false;
        removeclass(video_container,"showing");
    }

    var process_int,ctime,ptime,stoptimes = 0,playtimes = 0;
    function video_process() {
        ctime = video.currentTime;
        if(ptime != undefined){
            if(ctime == ptime){
                stoptimes++;
                playtimes = 0;
                if(stoptimes > 1 && !loading){
                    loading = true;
                    !showing&&show();
                    addclass(video_container,"loading");
                }
            }else{
                playtimes++;
                stoptimes = 0;
                if(playtimes > 1 && loading){
                    loading = false;
                    showing&&!hover&&hide();
                }
                removeclass(video_container,"loading");
            }
        }
        ptime = ctime;
    }
    function addprocess() {
        process_int = setInterval(video_process,1000)
    }
    function delprocess() {
        clearInterval(process_int);
        loading = false;
        removeclass(video_container,"loading");
    }

    lake.listen(video,"play",function (e) {
        hide();
        removeclass(video_container,"ending");
        removeclass(video_container,"pausing");
        addclass(video_container,"playing");
        playing = true;
        resize();
        // log.innerHTML +=(" play")
    });
    lake.listen(video,"pause",function (e) {
        delprocess();
        show();
        removeclass(video_container,"playing");
        addclass(video_container,"pausing");
        playing = false;
        resize();
        // log.innerHTML +=(" pause")
    });
    lake.listen(video,"ended",function (e) {
        delprocess();
        show();
        removeclass(video_container,"playing");
        addclass(video_container,"ending");
        playing = false;
        resize();
        // log.innerHTML +=(" ended")
    });
    lake.listen(video,"waiting",function (e) {
        // log.innerHTML +=(" waiting")
    });
    lake.listen(video,"playing",function (e) {
        // log.innerHTML +=(" playing")
    });
    lake.listen(video,"loadstart",function (e) {
        // log.innerHTML +=(" loadstart")
    });
    lake.listen(video,"progress",function (e) {
        // log.innerHTML +=(" progress");
        // console.log("networkState:"+video.networkState);
        // console.log("readyState:"+video.readyState);
        // console.log("paused:"+video.paused);
    });
    lake.listen(video,"loadeddata",function (e) {
        // log.innerHTML +=(" loadeddata")
    });
    lake.listen(video,"seeking",function (e) {
        // log.innerHTML +=(" seeking")
    });
    lake.listen(video,"suspend",function (e) {
        // log.innerHTML +=(" suspend")
    });
    lake.listen(video,"canplay",function (e) {
        canplay = true;
        // log.innerHTML +=(" canplay")
    });
    lake.listen(video,"load",function (e) {
        // log.innerHTML +=(" load")
    });
    lake.listen(video,"stalled",function (e) {
        // log.innerHTML +=(" stalled")
    });
    lake.listen(video,"timeupdate",function (e) {
        // log.innerHTML +=(" timeupdate")
    });


    var nav = lake.select("nav"),
        nav_contain = nav.firstElementChild,
        nav_wrap = nav_contain.firstElementChild,
        nav_width,nav_wrap_width,nav_cx,nav_startx,navtouch = false,nav_x = 0,tap = true;

    !touchable&&addclass(nav_contain,"hover");

    function setnav_w() {
        nav_width = nav_contain.clientWidth;
        nav_wrap_width = nav_wrap.scrollWidth;
    }
    setnav_w();
    function setnav_x() {
        nav_wrap.style[transform] = "translateX("+nav_x+"px)";
    }
    function setnav_arrow() {
        if(nav_wrap_width>nav_width){
            addclass(nav,"left");
            addclass(nav,"right");
            if(nav_x >= 0){
                removeclass(nav,"left");
            }
            if(nav_x <= -nav_wrap_width+nav_width){
                removeclass(nav,"right");
            }
        }else{
            removeclass(nav,"left");
            removeclass(nav,"right");
        }
    }
    setnav_arrow();
    function navmove(e) {
        var cur_x = e.touches[0].clientX;
        nav_x += cur_x - nav_cx;
        setnav_x();
        setnav_arrow();
        nav_cx = cur_x;
    }
    function navend(e) {
        var maxx = nav_wrap_width-nav_width,lenth = nav_cx - nav_startx;
        if(nav_x > 0 || (nav_x > -maxx && lenth>0 && lenth>18)){
            nav_x = 0;
        }else if(nav_x < -maxx || (nav_x < 0 && lenth<0 && lenth<-18)){
            nav_x = -maxx
        }
        setnav_arrow();
        setnav_x();
        addclass(nav_wrap,"animate");

    }
    function nav_resize() {
        setnav_w();
        setnav_arrow();
        navend();
    }

    lake.listen(nav_contain,"touchstart",function (e) {
        e.preventDefault();
        removeclass(nav_wrap,"animate");
        navtouch = true;
        nav_cx = nav_startx =  e.touches[0].clientX;
        // log.innerHTML += e.type +" ";
    });
    lake.listen(nav_contain,"touchmove",function (e) {
        e.preventDefault();
        tap = false;
        if(navtouch){
            navmove(e)
        }
        // log.innerHTML += e.type +". ";
    });
    lake.listen(nav_contain,"touchend",function (e) {
        e.preventDefault();
        navtouch = false;
        tap = true;
        navend(e);
        // log.innerHTML += e.type +" ";
    });
    lake.listen(nav_contain,"touchcancel",function (e) {
        e.preventDefault();
        navtouch = false;
        tap = true;
        navend(e);
        // log.innerHTML += e.type +" ";
    });

    var nav_a = lake.select(".nav_wrap em"),
        content = lake.select(".content"),
        content_wrap = content.firstElementChild;

    !touchable&&addclass(content,"hover");

    function set_content_h(index) {
        content_wrap.style.height = content_wrap.children[index].clientHeight + "px";
    }
    set_content_h(content_i);

    lake.each(nav_a,function (ele, i) {
        lake.listen(ele,touchable ? "touchend" : "click",function () {
            if(tap){
                removeclass(lake.select(".nav_wrap em.on"),"on");
                setTimeout(function () {
                    addclass(ele,"on")
                });
                content_wrap.style[transform] = "translateX(" + i*-100 + "%)";
                content_i = i;
                set_content_h(i);
            }
        });
        lake.listen(ele,"touchstart",function (){
            // e.preventDefault()
        })
    });

    lake.each(content_wrap.childNodes,function () {
        this.nodeType == 3 && content_wrap.removeChild(this)
    });
    lake.each(lake.select(".block_wrap"),function () {
        this.children.length & 1 &&  addclass(this.lastElementChild,"even")
    })

});
