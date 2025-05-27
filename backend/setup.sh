#!/bin/bash


echo "Creating MongoDB indexes..."
python -m backend.scripts.create_indexes

echo "Importing story data..."
python -m backend.scripts.import_data

echo "Done!"

echo "Starting Lateral Thinking Backend..."


# Start the uvicorn server
echo "Starting uvicorn server..."
uvicorn backend.main:app --host 0.0.0.0 --port 8001 --reload