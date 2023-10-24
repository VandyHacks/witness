import pandas as pd
from pymongo import MongoClient

# MongoDB connection settings
mongo_uri = "mongodb+srv://dev:vandyhacks@cluster0.udyna.mongodb.net/witness-vhx?retryWrites=true&w=majority"
db_name = 'witness-vhx'
collection_users = 'users'
collection_applications = 'applications'

# Connect to MongoDB
client = MongoClient(mongo_uri)
db = client[db_name]

# Query the data from both collections and join them
pipeline = [
    {
        "$lookup": {
            "from": collection_applications,
            "localField": "application",
            "foreignField": "_id",
            "as": "application_data"
        }
    },
    {
        "$unwind": "$application_data"
    },
    {
        "$project": {
            "_id":0,
            "name": 1,
            "email": 1,
            "school": "$application_data.school"
        }
    }
]

result = list(db[collection_users].aggregate(pipeline))

# Convert the result to a Pandas DataFrame
df = pd.DataFrame(result)

# Export the DataFrame to a CSV file
df.to_csv("output2.csv", index=False)

# Close the MongoDB connection
client.close()

print("Data exported to output.csv")
