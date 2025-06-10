import base64
import requests

# === USER CONFIGURATION ===

# Your B2 credentials
KEY_ID = "0034751e92175a90000000001"
APPLICATION_KEY = "K003YVrvKFo5j+JXpwU8LNzvUT/KquU"

# The fileId of the file you want to download from B2
FILE_ID = "4_z64a715e19e4932e197750a19_f107fa1062142071e_d20250609_m124741_c003_v0312030_t0015_u01749473261657"

# The output file name (will be saved in current directory)
OUTPUT_PATH = "downloaded_file.pdf"


# === INTERNAL LOGIC ===

def authorize_account():
    creds = f"{KEY_ID}:{APPLICATION_KEY}"
    b64_creds = base64.b64encode(creds.encode()).decode()

    print("🔐 Authorizing with B2...")
    resp = requests.get(
        "https://api.backblazeb2.com/b2api/v2/b2_authorize_account",
        headers={"Authorization": f"Basic {b64_creds}"}
    )
    resp.raise_for_status()

    data = resp.json()
    return {
        "auth_token": data["authorizationToken"],
        "api_url": data["apiUrl"],
        "download_url": data["downloadUrl"]
    }


def download_file_by_id(auth_token, api_url, file_id, output_path):
    url = f"{api_url}/b2api/v2/b2_download_file_by_id"
    headers = {
        "Authorization": auth_token
    }
    json_body = {
        "fileId": file_id
    }

    print(f"⬇️  Downloading file ID: {file_id}")
    resp = requests.post(url, headers=headers, json=json_body, stream=True)
    resp.raise_for_status()

    total = 0
    with open(output_path, "wb") as f:
        for chunk in resp.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)
                total += len(chunk)

    print(f"✅ Download complete: wrote {total:,} bytes to {output_path}")


if __name__ == "__main__":
    config = authorize_account()
    download_file_by_id(config["auth_token"], config["api_url"], FILE_ID, OUTPUT_PATH)
