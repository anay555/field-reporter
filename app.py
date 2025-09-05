# app.py
import streamlit as st
import base64, requests, json
from datetime import datetime

st.set_page_config(page_title="Field Reporter", layout="centered")
st.title("Field Reporter — demo (Make integration)")

WEBHOOK_URL = st.secrets.get("MAKE_WEBHOOK_URL")  # set this in Streamlit secrets

st.markdown("Upload a photo and optionally paste coordinates. We'll send this to the Make automation pipeline.")

name = st.text_input("Your name", value="Anonymous")
uploaded = st.file_uploader("Upload photo (jpg/png)", type=["jpg","jpeg","png"])
latlng = st.text_input("Latitude,Longitude (optional)", "")

if st.button("Send to Make for analysis"):
    if not uploaded:
        st.error("Please upload a photo.")
    else:
        bytes_data = uploaded.getvalue()
        b64 = base64.b64encode(bytes_data).decode("utf-8")
        data = {
            "reporter_name": name,
            "timestamp": datetime.utcnow().isoformat(),
            "image_base64": f"data:image/jpeg;base64,{b64}",
            "voice_base64": None
        }
        if latlng.strip():
            try:
                lat, lng = [float(x.strip()) for x in latlng.split(",")]
                data["latitude"] = lat
                data["longitude"] = lng
            except:
                st.warning("Invalid lat,lng format. Use: 24.1234,77.1234")
        # Post to Make webhook
        with st.spinner("Sending to Make..."):
            resp = requests.post(st.secrets["MAKE_WEBHOOK_URL"], json=data, timeout=60)
            if resp.status_code in (200,201):
                result = resp.json()
                st.success("Analysis complete.")
                st.write("**Category:**", result.get("category"), " (", result.get("confidence"), ")")
                st.markdown("**English report**")
                st.write(result.get("report_en"))
                st.markdown("**Hindi report**")
                st.write(result.get("report_hi"))
                st.markdown("**Address**")
                st.write(result.get("address"))
                if result.get("sms_status"):
                    st.info("SMS status: " + str(result.get("sms_status")))
            else:
                st.error(f"Make webhook returned {resp.status_code}: {resp.text}")
