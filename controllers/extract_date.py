# extract_datetime.py
import sys
import dateparser
import json
from datetime import datetime
from dateparser.search import search_dates

# Read the transcription text from command-line argument
text = sys.argv[1]

# Parse the text to extract datetime
parsed = dateparser.parse(text,settings={'PREFER_DATES_FROM': 'future'})



# Return result as JSON
if parsed:
    result = {
        "date": parsed.strftime("%Y-%m-%d"),
        "time": parsed.strftime("%H:%M:%S") 
    }
else:
    result = {
        "date": None,
        "time": None
    }

print(json.dumps(result))

# parsed = search_dates(text,settings={'PREFER_DATES_FROM': 'future','RELATIVE_BASE': datetime.now()})
# output = []
# if parsed:
#     for phrase, dt in parsed:
#         output.append({
#             "original": phrase,
#             "date": dt.strftime("%Y-%m-%d"),
#             "time": dt.strftime("%H:%M:%S")
#         })

# print(json.dumps(output))
