"""A real lexical retrieval baseline on three original toy documents.
This lab implements TF-IDF/cosine, not a generative model or trained embedding.
"""
from collections import Counter
from math import log, sqrt
import re
import unicodedata

documents = {
    "split": "Pipeline chỉ fit tiền xử lý trên tập train.",
    "token": "Tokenization đổi văn bản thành token trước embedding.",
    "lora": "LoRA huấn luyện ma trận cập nhật hạng thấp.",
}
def tokenize(text):
    return re.findall(r"[^\W\d_]+", unicodedata.normalize("NFC", text).casefold())

counts = {key: Counter(tokenize(text)) for key, text in documents.items()}
vocabulary = sorted(set().union(*(set(c) for c in counts.values())))
idf = {term: log((1+len(documents))/(1+sum(term in c for c in counts.values())))+1
       for term in vocabulary}
def vector(text):
    c = Counter(tokenize(text))
    values = [c[t]*idf[t] for t in vocabulary]
    norm = sqrt(sum(v*v for v in values))
    return [v/norm for v in values] if norm else [0.]*len(values)

index = {key: vector(text) for key, text in documents.items()}
def retrieve(query, allowed, k=2):
    q = vector(query)  # reuse the fitted vocabulary/IDF; never fit on the query
    scores = [(sum(a*b for a,b in zip(q,d)), key)
              for key,d in index.items() if key in allowed]
    return [key for score,key in sorted(scores,key=lambda item:(-item[0],item[1]))[:k]
            if score > 0]

result = retrieve("Pipeline fit tập train", {"split", "token"})
assert result == ["split"]
assert retrieve("LoRA", {"split", "token"}) == []  # ACL excludes lora
assert retrieve("từkhóangoàivocabulary", set(documents)) == []
print("retrieved=" + ",".join(result))
print("unknown_query=abstain acl_check=passed")
