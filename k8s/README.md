minikube tunnel -c
minikube dashboard --url
ssh -i ~/.minikube/machines/minikube/id_rsa -L 192.168.1.69:9080:192.168.49.2:30391 -N -f docker@192.168.49.2
ssh -i ~/.minikube/machines/minikube/id_rsa -L 192.168.1.69:16686:192.168.49.2:30432 -N -f docker@192.168.49.2
minikube service gateway --url
minikube ip
