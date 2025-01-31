from pytubefix import YouTube
from pytubefix.cli import on_progress
import requests
import sys
import os
import json

def download_thumbnail(url,name):
    img_data = requests.get(url).content
    extension = url.split(".")
    thumbnail_name = f"{name}.{extension[-1]}"
    with open(f'./content/thumbnails/{thumbnail_name}','wb') as handler:
        handler.write(img_data)

    return extension[-1]


def download_song(url,path_save = './content/songs'):
    video_data = YouTube(url,'WEB',on_progress_callback=on_progress)
    audio = video_data.streams.get_audio_only()

    title = audio.title
    audio.download(path_save)
    extension = download_thumbnail(video_data.thumbnail_url,audio.title)

    

    for ext in ['m4a','mp3','flac','mp4','wav','wma','aac','alac','aiff']:
        fileExists = os.path.exists(f'./content/songs/{title}.{ext}')
        if(fileExists):
            songPath = f'./content/songs/{title}.{ext}'
            break

    paths = {
        'filePath':songPath,
        'thumbnailPath':f'./content/thumbnails/{title}.{extension}'
    }

    print(paths)
    with open('./content/temp.json') as temp:
        data = json.load(temp)
        data = {
            data[title]['title']:{
                'filesize':data[title]['filesize'],
                'title':data[title]['title'],
                'file_path':paths['filePath'],
                'thumbnail_url':paths['thumbnailPath']
            }
        }
        
    with open('./content/main.json') as mainfile:
        main_data = json.load(mainfile)
        main_data.update(data)
    # print(main_data)
    with open('./content/main.json','w') as mainFileWrite:
        json.dump(main_data,mainFileWrite,sort_keys=True,indent=4)
    with open('./content/temp.json','w') as tempWrite:
        s = json.loads('{"demo":"demo"}')
        json.dump(s,tempWrite)

        


def retrive_song(url,path_save = './content/songs'):
    video_data = YouTube(url,'WEB',on_progress_callback=on_progress,)
    audio = video_data.streams.get_audio_only()
    audio_data = {
        'thumbnail_url':video_data.thumbnail_url,
        'title': video_data.title,
        'filesize':audio.filesize_mb
    }

    title = audio_data['title']
    for ext in ['m4a','mp3','flac','mp4','wav','wma','aac','alac','aiff']:
        already_exists = os.path.exists(f'./content/songs/{title}.{ext}')
        # print(already_exists)
        if(already_exists==True):
            print('Song Already Exits in library')
            sys.exit()
            return 1
    
    temp_json_value = {audio.title:audio_data}
    with open('./content/temp.json') as f:
        data = json.load(f)
        data.update(temp_json_value)
        # print(data) 

    with open('./content/temp.json','w') as f:
        json.dump(data,f,sort_keys=True)

    return 0

def resetTemp():
    data = '{ "demo":"demo" }'
    data = json.loads(data)
    with open('./content/temp.json','w') as tempFile:
        json.dump(data,tempFile,sort_keys=True)

    print('temp File reset')

with open('./content/url.json') as jsonFile:
    # print('s :',sys.argv)
    json_content = json.load(jsonFile)
    url = json_content['url']
    if(sys.argv[1] == 'download'):
        download_song(url)
        print('download_complete')
    elif(sys.argv[1] == 'retrive'):
        retrive_song(url)
        print('retirve_complete')
    elif(sys.argv[1] == 'reset'):
        resetTemp()
    jsonFile.close()
    
sys.exit()
    