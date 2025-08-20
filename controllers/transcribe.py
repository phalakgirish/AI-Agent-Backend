import whisper
import sys
import json

try:
    model = whisper.load_model("small")
    audio_path = sys.argv[1]

    # result = model.transcribe(audio_path,word_timestamps=True, verbose=False)
    result = model.transcribe(audio_path)

    print(json.dumps(result["text"]))
#     segments = [
    
#         # "start": round(seg["start"], 2),
#         # "end": round(seg["end"], 2),
#         seg["text"].strip()
    
#     for seg in result["segments"]
# ]
#     # print(json.dumps(result["segments"]))
#     print(json.dumps(segments, ensure_ascii=False, indent=2))

except Exception as e:
    import traceback
    traceback.print_exc()
    print(f"Error: {str(e)}", file=sys.stderr)
    sys.exit(1)