#!/bin/bash


escape_string() {
    echo "$1" | sed -e 's/[\/&]/\\&/g'
}

# Function to add a line before a specific line in a file
add_string() {
    filename="$1"
    search_string=$(escape_string "$2")
    line_to_add="$3"

    # Check if the string already exists in the file
    if ! grep -q "$line_to_add" "$filename"; then

        # Check if the OS is macOS or Linux and use the appropriate sed syntax
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "/$search_string/i\\
            $line_to_add\\
            " "$filename"
        else
            sed -i "/$search_string/i $line_to_add\\n" "$filename"
        fi
    fi
}

# Function to replace a string in a file
replace_string() {
    filename="$1"
    search_string=$(escape_string "$2")
    replacement_string="$3"

    # Check if the OS is macOS or Linux and use the appropriate sed syntax
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/$search_string/$replacement_string/g" "$filename"
    else
        sed -i "s/$search_string/$replacement_string/g" "$filename"
    fi
}
# Define the variables (similar to the arguments in the original main function)
# Default values for the variables
ca_file_path="ca.pem"
key_file_path=null
pem_file_path=null
common_name="localhost"

for i in "$@"
do
case $i in
    -ca=*|--cafile=*)
    ca_file_path="${i#*=}"
    shift
    ;;
    -key=*|--keyfile=*)
    key_file_path="${i#*=}"
    shift
    ;;
    -cert=*|--certfile=*)
    pem_file_path="${i#*=}"
    shift
    ;;
    -cn=*|--commonname=*)
    common_name="${i#*=}"
    shift
    ;;
esac
done


# Assume that the mod_file is known and is a parameter to the script
mod_file=$(find ./node_modules/@zilliz/milvus2-sdk-node/dist/milvus -name "GrpcClient.js")

# Add the necessary lines to the file
add_string "$mod_file" "this.client = new MilvusService" "var ca = fs_1.readFileSync(\"$ca_file_path\");"
if [[ -n "$key_file_path" && "$key_file_path" != "null" ]]; then
  add_string "$mod_file" "this.client = new MilvusService" "var key = fs_1.readFileSync(\"$key_file_path\");"
else
  add_string "$mod_file" "this.client = new MilvusService" "var key = null;"
fi
if [[ -n "$pem_file_path" && "$pem_file_path" != "null" ]]; then
  add_string "$mod_file" "this.client = new MilvusService" "var cert = fs_1.readFileSync(\"$pem_file_path\");"
else
  add_string "$mod_file" "this.client = new MilvusService" "var cert = null;"
fi
add_string "$mod_file" "this.config.channelOptions" "\"grpc.ssl_target_name_override\": \"$common_name\","
add_string "$mod_file" "require(\"./User\")" "var fs_1 = require(\"fs\");"

# Replace a specific string in the file
replace_string "$mod_file" "credentials.createSsl()" "credentials.createSsl(ca, key, cert, true)"