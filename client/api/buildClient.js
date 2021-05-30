import axios from 'axios'

// See how the ingress-nginx-controller service is under the namespace (-n) of ingress-nginx
// Thus giving us a url of  <service>.<namespace>.svc.cluster.local
// user:~/k8s$ k get services -n ingress-nginx
// NAME                                 TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)                      AGE
// ingress-nginx-controller             NodePort    10.110.159.153   <none>        80:31212/TCP,443:31189/TCP   8h
// ingress-nginx-controller-admission   ClusterIP   10.105.129.18    <none>        443/TCP                      8h

const buildClient = ({ req }) => {
  if (typeof window == 'undefined') {
    // We are on the server
    return axios.create({
      baseURL:
        'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      // baseURL: 'http://ingress-nginx-controller.kube-system.svc.cluster.local',
      headers: req.headers,
    })
  } else {
    // We must be on the browser
    return axios.create({
      baseUrl: '/',
    })
  }
}

export default buildClient
