import firebase_admin
from firebase_admin import credentials, storage, auth
from decouple import config

if not firebase_admin._apps:
    cred_path = os.path.join('backend/firebase/serviceAccountKey.json')
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred, {
        'storageBucket': config('FIREBASE_STORAGE_BUCKET', default='scoresync-3ce4c.appspot.com')
    })
    
bucket = storage.bucket()

def upload_profile_picture(file_obj, filename):
    blob = bucket.blob(f"profile_pictures/{filename}")
    blob.upload_from_file(file_obj, content_type='image/jpeg')
    blob.make_public()
    return blob.public_url
