import api from './axios'

export const fetchAteliers = async () => {
  const { data } = await api.get('/ateliers')
  return data
}

export const fetchAtelierDetail = async (id) => {
  const { data } = await api.get(`/ateliers/${id}`)
  return data
}

export const inscrireAtelier = async (id) => {
  const { data } = await api.post(`/ateliers/${id}/inscription`)
  return data
}

export const desinscrireAtelier = async (id) => {
  const { data } = await api.delete(`/ateliers/${id}/inscription`)
  return data
}

export const fetchMesInscriptions = async () => {
  const { data } = await api.get('/mes-inscriptions')
  return data
}
