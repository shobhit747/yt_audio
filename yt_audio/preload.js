const { ipcRenderer,contextBridge } = require('electron/renderer')


contextBridge.exposeInMainWorld('electronAPI',{
    saveUrlJson:(urlJson)=>ipcRenderer.send('saveUrlJson',urlJson),
    savedUrlJsonReply:(callback)=>ipcRenderer.on('saveUrlJsonReply',(_event,arg)=>callback(arg)),
    downloadSong:(data)=>ipcRenderer.send('downloadSong',data),
    downloadSongReply:(callback)=>ipcRenderer.on('downloadSongReply',(_event,arg)=>callback(arg)),
    loadSongList:()=>ipcRenderer.send('loadSongList'),
    loadSongListReply:(callback)=>ipcRenderer.on('loadSongListReply',(_event,arg)=>callback(arg))
})
