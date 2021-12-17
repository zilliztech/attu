---
id: attu_data.md
related_key: attu
summary: Attu, an intuitive GUI for Milvus service management.
---

# Manage Data with Attu

This topic describes how to manage data with Attu.

## Import data

This example imports 20,000 rows of data. Importing data appends data instead of overwriting data.

1. Click **Import Data** on the **Collection** page. The **Import Data** dialog box appears as shown below.

![Import Data](../assets/insight_data1.png)

2. Select the collection you want to import data to in the **Collection** dropdown list.
3. Select the partition you want to import data to in the **Partition** dropdown list.
4. Click **Choose CSV File** and choose a CSV file.

<div class="alert note"> Ensure that the CSV file meets the following criteria:
<ul>
<li>Column names are the same as the field names specified in the schema;</li>
<li>The file is smaller than 150MB and the row count is less than 100,000.</li>
</ul>
</div>

5. After a legal CSV file is selected, you can then proceed by clicking **Next**.

![Import Data](../assets/insight_data2.png)

6. On the new dialog box, you can match the field names by clicking the corresponding cells in the dropdown lists.

<div class="alert note">
We recommend making the headers (column names) as the first row in your CSV file.
</div>

![Import Data](../assets/insight_data3.png)

7. After confirming the column names corresponding to the field names, click **Import Data** to import the CSV file into Milvus. Importing data might take a while.

![Import Data](../assets/insight_data4.png)

8. If successful, the row count status updates in the Entity Count column of the collection. On the corresponding Partition tab page, the row count status updates in the Entity Count column of the partition your imported data in. It might take a while for the entity count to update.

![Import Data](../assets/insight_data5.png)

## Export Data

1. Click **Data Query** on the **Collection** page. On the **Data Query** tab page, enter query conditions in the field and then click **Query** to retrieve all query results that match your query conditions.

2. Click the **Download** icon to download the query results as a CSV file.

![Export Data](../assets/insight_data6.png)
