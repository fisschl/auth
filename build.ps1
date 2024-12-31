$image = "registry.cn-shanghai.aliyuncs.com/fisschl/auth:latest"

docker build -t $image .
docker push $image
