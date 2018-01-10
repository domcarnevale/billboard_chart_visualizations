import numpy as np
import pandas as pd
import string
from textblob import TextBlob
from math import sin, cos

# Load data
df_billboard = pd.read_csv('data/Hot100.csv', index_col=None)
df_songs = pd.read_csv('data/musicology.csv', index_col=None)

#convert artists and songs to all lowercase to allow proper joining
df_songs["Song title"] = df_songs["Song title"].map(lambda x: x.translate(None, string.punctuation).lower())
df_songs["Artist name"] = df_songs["Artist name"].map(lambda x: x.translate(None, string.punctuation).lower())
df_billboard["song"] = df_billboard["song"].map(lambda x: x.translate(None, string.punctuation).lower())
df_billboard["artist"] = df_billboard["artist"].map(lambda x: x.translate(None, string.punctuation).lower())

song_list = df_billboard['song'].tolist()
artist_list = df_billboard['artist'].tolist()

#group and compute average position of Billboard data
df_billboard = df_billboard.groupby(['song', 'artist']).agg(
    {'date': np.min, 'position': np.min, 'count': np.sum})
df_billboard = df_billboard.sort_index()

#Drop entries from Million Song Dataset without location data
df_songs['Longitude'] = pd.to_numeric(df_songs['Longitude'], errors='coerc')
df_songs = df_songs.dropna()

#Filter out artists not from the U.S.
df_songs = df_songs[(df_songs['Latitude'] <= 48.987386) & (df_songs['Latitude'] >= 18.005611) &
                    (df_songs['Longitude'] >= -124.626080) & (df_songs['Longitude'] <= -62.361014)]

#group by song, artist, album, and location
df_songs = df_songs.groupby(['Song title', 'Artist name', 'Album title', 'Location'])
                            .agg({'Duration':np.average,'Artist familiarity':np.average,
                            'Artist Hotttnesss':np.average, 'Latitude':np.average,
                            'Longitude':np.average, 'End of fade in':np.average,
                            'Key':np.min, 'Loudness':np.average,'Mode':np.min, 
                            'Danceability': np.max, 'Energy': np.max, 
                            'Song Hotttnesss':np.average, 'Start of fade out':np.average,
                            'Tempo':np.average, 'Time signature':np.max, 'Year':np.min}).reset_index()


df_songs = df_songs.sort_index()

#Rename columns for merging purposes
df_billboard.columns = ['Song title','Artist name', 'Entry Date' ,'Top Position']

#Merge data frames and drop unwanted columns
df_merged = pd.merge(df_songs.reset_index(), df_billboard.reset_index(), on=['song'], how='inner')
df_merged = df_merged.drop(df_merged.columns[[0, 18, 20, 21, 22, 23, 26]], axis=1)

#Removes corrupt location entries (corrupt entries contained numbers rather than city/state name)
searchfor = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
df_merged = df_merged[~df_merged['Location'].str.contains('|'.join(searchfor))]

#Create month and year fields then delete date
df_merged['Entry Month'] = df_merged['Entry Date'].dt.strftime('%B')
df_merged['Entry Year'] = df_merged['Entry Date'].dt.strftime('%Y')
df_merged = df_merged.drop(df_merged.columns[19] axis=1)

#Filter locations that don't contain states and then create state field
df_merged = df_merged[df_merged['Location'].str.contains('.*; [A-Z]{2}', regex=True)]
df_merged['State'] = df_merged['Location'].str.extract('([A-Z]{2})', expand=True)

#Replace Mode and Key fields with corresponding text
df_merged[['Mode', 'Key', 'Year', 'Entry Year']] = df_merged[['Mode', 'Key', 'Year', 'Entry Year']].astype(int)
df_merged = df_merged.replace({'Key': {0:'C', 1:'Db', 2:'D', 3:'Eb', 5:'F', 6:'Gb', 7:'G', 8:'Ab', 9:'A', 10:'Bb'}
                                'Mode': {0:'Minor', 1:'Major'}})
                                
#Convert to CSV and save                                
song_data = df_merged.to_csv()
target = open('song_data.csv', 'w')
target.write(song_data)
target.close()
