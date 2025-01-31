const {app, BrowserWindow, ipcMain, ipcRenderer } = require('electron/main');
const { stdout, stdin, stderr } = require('process');
const { exec } = require('child_process');
const fs = require('fs')
const path = require('path');
const { log } = require('console');


const createWindow = () =>{
    const win = new BrowserWindow({
        width:1280,
        height:850,
        minHeight:850,
        minWidth:1280,
        autoHideMenuBar:true,
        titleBarOverlay:true,
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#000000',
            symbolColor: '#fffffff',
            height: 30
        },
        webPreferences: {
            contextIsolation:true,
            nodeIntegration:true,
            preload:path.resolve('./preload.js')
        }

        
    })
    ipcMain.on('saveUrlJson',(event,jsonValue)=>{
        let urlValue = JSON.parse(jsonValue);
        if(urlValue['url'] != ""){
            fs.writeFile(path.resolve('./content/url.json'),jsonValue,(err)=>{
                if(!err){
                    // console.log("url added");
                    exec('pipenv run python3 main.py retrive',(err,stdout,stderr)=>{
                        if(!err){
                            console.log(`stdout: ${stdout}`);
                            fs.readFile(path.resolve('./content/temp.json'),(err,retrivedData)=>{
                                if(!err){
                                    let jsonData = JSON.parse(retrivedData);
                                    console.log(jsonData);
                                    event.reply('saveUrlJsonReply',jsonData);
                                }
                                
                                
                            })
                            
                            
                        }else{
                            console.log(err);
                        }
                        
                        
                    })
                }else{
                    console.log(err);
                }
            })

        }else{
            console.log('no url');
            
        }
        console.log('here');
        
    })
    ipcMain.on('downloadSong',(event,data)=>{
        console.log(data);
        exec('python3 main.py download',(err,stdout,stderr)=>{
            if(!err){
                console.log('download complete');
                fs.readFile(path.resolve('./content/main.json'),(err,data)=>{
                    let mainData = JSON.parse(data)
                    event.reply('downloadSongReply',mainData)
                })
                
            }
        })
    })

    ipcMain.on('loadSongList',(event,data)=>{
        fs.readFile(path.resolve('./content/main.json'),(err,data)=>{
            let mainData = JSON.parse(data)
            event.reply('loadSongListReply',mainData)
        })
        let tempData = '{"demo":"demo"}';

        exec('pipenv run python3 main.py reset');
    })
    win.loadFile('music_gallery.html');
}


// ipcMain.on('')

app.whenReady().then(() => {
    createWindow();
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})