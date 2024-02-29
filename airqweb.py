"""
cameractrl.py
Python Bottle script for showing air quality data from an influxdb
electro-dan.co.uk
based on:
https://funprojects.blog/2020/01/12/pi-rover-using-bottle-web-framework/
https://electronut.in/talking-to-a-raspberry-pi-from-your-phone-using-bottle-python/
"""

import logging
from bottle import route, request, run, get, static_file #sudo apt install python3-bottle
from influxdb import InfluxDBClient
import os
import datetime

logging.basicConfig(format='[%(levelname)s] %(asctime)s %(message)s', level=logging.INFO)
logger = logging.getLogger()

# use decorators to link the function to a url
@route('/')
def server_static():
    return static_file("airqweb.html", root='')

@route('/data')
def server_static():
    return static_file("airqdata.html", root='')

@route('/airqweb.js')
def server_static():
    return static_file("airqweb.js", root='')

@route('/airqweb.css')
def server_static():
    return static_file("airqweb.css", root='')

@route('/shutdown')
def server_static():
    return static_file("shutdown.html", root='')

# Process an AJAX POST request
@route('/action', method='POST')
def do_action():
    json_request = request.json
    action = json_request.get("action")
    errorMessage = ""
    
    print("Requested action: " + action)
    
    if action == "query_data":
        logging.info("Running query")
        
        # Return the result set from influxdb 
        # Connect to local instance
        client = InfluxDBClient(host='localhost', port=8086)
        
        # Use airq database (created by running client.create_database('airq'))
        client.switch_database('airq')
        
        db_query = "SELECT time, pm10, pm2_5, pm1_0, temperature, humidity, iaq, raw_pressure"
        if "all_columns" in json_request:
            if json_request.get("all_columns") == "Y":
                db_query = "SELECT time, pm10, pm2_5, pm1_0, temperature, humidity, iaq, iaq_accuracy, raw_pressure, breath_voc_equivalent, breath_voc_accuracy, co2_equivalent, co2_accuracy, gas_percentage, gas_percentage_accuracy"
        db_query += " FROM air_sensors "
        
        if "minus_days" in json_request:
            minus_days = int(json_request.get("minus_days"))
            db_query += f"WHERE time > now() - {minus_days}d"
        if "query_date" in json_request:
            d_query_from = datetime.datetime.now().date()
            try:
                d_query_from = datetime.datetime.strptime(json_request.get("query_date"), "%Y-%m-%d")
            except ValueError:
                d_query_from = datetime.datetime.now().date()

            d_query_to = d_query_from + datetime.timedelta(days=1)
            d_query_from_s = d_query_from.strftime("%Y-%m-%d")
            d_query_to_s = d_query_to.strftime("%Y-%m-%d")
            db_query += f"WHERE time >= '{d_query_from_s} 00:00:00' AND time < '{d_query_to_s} 00:00:00'"
        db_query += " ORDER BY time"
        if "order_by_time" in json_request:
            if json_request.get("order_by_time") == "desc":
                db_query += " DESC"
        
        logging.debug(f"Running query: {db_query}")
        results = client.query(db_query)

        # Example
        # {'statement_id': 0, 'series': [{'name': 'air_sensors', 'columns': ['time', 'location', 'pm10', 'pm1_0', 'pm2_5'], 'values': [['2024-02-01T21:13:09.770561546Z', 'Bedroom', 72, 36, 65], ['2024-02-01T22:00:01.406136346Z', 'Bedroom', 43, 22, 36]]}]}
        db_result = results.raw
        db_result.pop("statement_id") # remove statement_id, not needed
        db_result["status"] = "OK" # add status

        return db_result
    elif action == "shutdown":
        os.system("sudo shutdown -h +1") # Shutdown in 1 minute
        logging.info("Scheduled shutdown")
    else:
        errorMessage = "Unknown action"
    
    if errorMessage != "":
        logging.error(errorMessage)
        return {'status':'ERROR','message':errorMessage}

    # Always return status
    return {'status':'OK'}


run(host = '0.0.0.0', port = '8080')
