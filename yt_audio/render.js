window.electronAPI.loadSongList();
let songListGlobal,keysGlobal;
window.electronAPI.loadSongListReply((arg)=>{
    songListGlobal = arg;
    let keys = Object.keys(arg);
    keysGlobal = keys;
    let libraryList = document.getElementById('libraryList');
    let songList ='';

    for (let i = 0; i < keys.length; i++) {
        // console.log(arg[keys[i]]);
        
        if(keys[i]!= "demo" && arg[keys[i]] != undefined){
            // console.log(keys[i],arg[keys[i]]);

            let title = arg[keys[i]]['title'];
            let songEle = `
                <div class="song" onclick="playMusic(${i})">
                    <div class="thumbnail">
                        <img src="./content/thumbnails/${arg[keys[i]]['title']}.jpg" alt="">
                    </div>
                    <div class="songName">
                        ${arg[keys[i]]['title']}
                    </div>
                </div>
                `
            songList=songList+'\n'+songEle
        }
        
    }
    libraryList.innerHTML = songList;
})
let addBtn = document.getElementById('addBtn');
let loading = document.getElementById('loading');

function showLoading(){
    console.log(loading);
    
    loading.style.width = '0%';
    loading.setAttribute('color','#801A86')
    setTimeout(() => {
        loading.style.width = '25%';
    }, 500);
    setTimeout(() => {
        loading.style.width = '75%';
    }, 700);
}
function hideLoading(){
    loading.style.width = '100%';
    loading.setAttribute('color','#0000')
    // loading.style.width = '0%';
}
let retrivedInfo;
addBtn.onclick = () =>{
    let url = document.getElementById('youtubeUrl').value;
    let urlJson = `{ "url" : "${url}" }`;
    showLoading();
    window.electronAPI.saveUrlJson(urlJson);
}

window.electronAPI.savedUrlJsonReply((arg)=>{
    hideLoading();
    let key = Object.keys(arg)[0];
    let songData = arg[key];
    console.log(songData);
    
    let thumbnail = document.querySelector("#askForDownload #thumbnailImg")
    let title = document.querySelector("#askForDownload #songTitle")
    let filesize = document.querySelector("#askForDownload h4")

    // console.log(thumbnail,title,filesize);
    
    thumbnail.setAttribute('src',songData['thumbnail_url']);
    title.innerHTML = songData['title'];
    let s = songData['filesize']
    filesize.innerHTML = `${s.toString().slice(0,4)} MB`;

    let showPiece = document.getElementById('showPiece');
    showPiece.style.display = 'none';
    let downloadbox = document.getElementById('askForDownload');
    downloadbox.style.display = 'block';
    let nowPlaying = document.getElementById('nowPlaying');
    console.log(nowPlaying);
    
    nowPlaying.style.display = 'none';
    setTimeout(() => {
        downloadbox.style.opacity = '1';
    }, 200);



    let cancelDownload = document.getElementById('cancelDownload');
    cancelDownload.onclick = ()=>{
        downloadbox.style.display = 'none';
        showPiece.style.display = 'block';
        document.getElementById('youtubeUrl').value = '';
        window.electronAPI.loadSongList();
    }
    resetPlayer();
})

let downloadBtn = document.getElementById('downloadSong');
console.log(downloadBtn);


downloadBtn.onclick = ()=>{
    console.log('clicked');
    
    window.electronAPI.downloadSong('download song');
    showLoading();
}

window.electronAPI.downloadSongReply((arg)=>{
    hideLoading()
    window.electronAPI.loadSongList();

    
    
})

let playbtn = document.getElementById('playbtn');
let pausebtn = document.getElementById('pausebtn');

let audio = document.getElementById('song')
if(audio.getAttribute('src') == ''){
    playbtn.setAttribute('disabled','true');
    pausebtn.setAttribute('disabled','true');
}


let pastebtn = document.getElementById('pasteButton');
pastebtn.onclick = () =>{
    let url = document.getElementById('youtubeUrl');
    navigator.clipboard.readText()
    .then(urlText=>{
        url.value = urlText;

    })
    // url.setAttribute('value','')
}

playbtn.onclick=()=>{
    audio.play()
    playbtn.style.display = 'none';
    pausebtn.style.display = 'block';
}
pausebtn.onclick=()=>{
    audio.pause()
    pausebtn.style.display = 'none';
    playbtn.style.display = 'block';

}

function resetPlayer(){
    pausebtn.click();
    audio.setAttribute('src','');
    playbtn.setAttribute('disabled','true');
    pausebtn.setAttribute('disabled','true');
    let progressBar = document.getElementById('progressBar');
    progressBar.style.width = '0';
}

function playMusic(num){
    let song = songListGlobal[keysGlobal[num]];
    console.log(song);
    
    audio.setAttribute('src',song['file_path'])
    console.log(audio);
    
    let downloadbox = document.getElementById('askForDownload');
    


    let nowPlaying = document.getElementById('nowPlaying');
    let thumbnail = document.querySelector('#nowPlaying img');
    let songTitle = document.querySelector('#nowPlaying h3');
    let songDuration = document.querySelector('#nowPlaying h4');
    thumbnail.setAttribute('src',song['thumbnail_url'])
    songTitle.innerHTML = song['title'];
    audio.onloadedmetadata = () =>{
        let duration = audio.duration/60
        songDuration.innerHTML = `Duration : ${duration.toString().slice(0,3)}s`;
    }

    let showPiece = document.getElementById('showPiece');
    showPiece.style.display = 'none';
    downloadbox.style.display = 'none';
    if(nowPlaying.style.opacity == '1'){
        nowPlaying.style.opacity = '0';
    };
    nowPlaying.style.display = 'block';
    setTimeout(() => {
        nowPlaying.style.opacity = '1';

    }, 200);
    
    document.getElementById('progressBar').style.width = '0';
    pausebtn.style.display = 'none';
    playbtn.style.display = 'block';

    if(audio.getAttribute('src') != ''){
        playbtn.removeAttribute('disabled');
        pausebtn.removeAttribute('disabled');
    }
    resetDeleteBtn();
}

let audioContainer = document.getElementById('audioContainer');
let progressBar = document.getElementById('progressBar')
audioContainer.onclick = (event) =>{
    if(audio.getAttribute('src') != ''){
        let skipPercent = (event.offsetX/audioContainer.offsetWidth)*100;
        progressBar.style.width = `${skipPercent}%`;
        audio.currentTime = (skipPercent/100)*audio.duration;
    }
    
}


audio.ontimeupdate =()=>{
    let currentTime = audio.currentTime;
    let duration = audio.duration;
    let state = (currentTime/duration)*100;
    let progressBar = document.getElementById('progressBar');
    progressBar.style.width = `${state}%`;
    if(currentTime == duration){
        pausebtn.click();
        audio.currentTime = 0;
        progressBar.style.width = '0';
    }
}
let spacePressed = false;
document.addEventListener('keypress',(event)=>{
    if(event.keyCode == 32){
        if(!spacePressed){
            playbtn.click()
            spacePressed = true;
        }else{
            pausebtn.click()
            spacePressed = false;
        }
    }
    
})


let deleteSongBtn = document.getElementById("deleteSong");
let deleteConfirm = document.getElementById("deleteConfirm");
let cancelDelete = document.getElementById("cancelDelete");
let deleteWarning = document.getElementById("deleteWarning");

deleteSongBtn.onclick = () =>{
    deleteSongBtn.style.display = "none";
    deleteWarning.style.display = "flex";
}

cancelDelete.onclick = () =>{
    deleteWarning.style.display = "none";
    deleteSongBtn.style.display = "flex";
}

function resetDeleteBtn(){
    deleteWarning.style.display = "none";
    deleteSongBtn.style.display = "flex";
}

deleteConfirm.onclick = () =>{
    let song = document.getElementById("songTitle").innerText;
    window.electronAPI.deleteSong(song);
}

window.electronAPI.deleteSongReply((arg)=>{
    window.electronAPI.loadSongList();
    resetPlayer();
    let showPiece = document.getElementById("showPiece");
    let nowPlaying = document.getElementById("nowPlaying");
    nowPlaying.style.display = "none";
    showPiece.style.display = "block";
})