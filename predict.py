import re
import sys
import nltk
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
import pickle
import pymongo
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer

import warnings
warnings.filterwarnings("ignore")

#load data from database
client = pymongo.MongoClient("mongodb://127.0.0.1:27017/")
db = client["chat-app"]
users = db['users']

texts = []

userslist = list(users.find({}))

for x in userslist:
    if(len(x['texts']) >= 1):
        texts.append(x['texts'])

#preprocess data

process = [""]*len(texts)

for i,user in enumerate(texts):
    for text in user:
        process[i] += text['text'] + " "

ps = PorterStemmer()
corpus = []
for i in range(0, len(process)):
    review = re.sub("(@[A-Za-z0-9]+)|([^0-9A-Za-z \t])|(\w+:\/\/\S+)|[^\w\s{}]"," ",process[i]).lower().strip().split()
    review = [ps.stem(word) for word in review if not word in stopwords.words('english')]
    # print(review)
    review = ' '.join(review)
    corpus.append(review)

# print(corpus)

#predict
if(len(texts) > 0):
    svc = pickle.load(open('./depressed_model.sav', 'rb'))
    pred = svc.predict(corpus)
    print(len(pred))
    i = 0
    for x in userslist:
        if(len(x['texts']) >= 1):
            users.update_one({'_id':x['_id']}, {'$set':{'warning': bool(not pred[i])}})
            i+=1
        



