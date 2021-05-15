import axios from 'axios';

// users
const me = () => {
  return axios.get(`/api/me`)
}

const getUser = (uid) => {
  return axios.get(`/api/users/${uid}`)
}

const putFollow = (uid) => {
  axios.put(`/api/follows/${uid}`)
}

const delFollow = (uid) => {
  axios.delete(`/api/follows/${uid}`)
}

const getFollows = (uid) => {
  return axios.get(`/api/users/${uid}/follows`)
}

const getFollowers = (uid) => {
  return axios.get(`/api/users/${uid}/followers`)
}

// movie
const search = (q) => {
  return axios.get(`/api/search?q=${q}`)
}

const getMovie = (mid) => {
  return axios.get(`/api/movies/${mid}`)
}

// collections
const getCollections = (uid) => {
  return axios.get(`/api/users/${uid}/collections`)
}

const newCollection = () => {
  return axios.post(`/api/collections`)
}

const putCollection = (cid, props) => {
  axios.put(`/api/collections/${cid}`, props)
}

const delCollection = (cid, mid) => {
  axios.delete(`/api/collections/${cid}`)
}

// collection content
const getCollection = (cid) => {
  return axios.get(`/api/collections/${cid}`)
}

const insertCollection = (cid, mid) => {
  axios.put(`/api/collections/${cid}/movies/${mid}`)
}

const popCollection = (cid, mid) => {
  axios.delete(`/api/collections/${cid}/movies/${mid}`)
}

export {
  me, getUser, getFollows, getFollowers, putFollow, delFollow,
  search, getMovie,
  getCollections, newCollection, putCollection, delCollection,
  getCollection, insertCollection, popCollection,
}
