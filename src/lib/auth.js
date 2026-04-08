import { supabase } from './supabase'

export const signInWithMagicLink = async (email) => {
  const { error } = await supabase.auth.signInWithOtp({ email })
  if (error) throw error
}

export const signInWithPhone = async (phone) => {
  const { error } = await supabase.auth.signInWithOtp({ phone })
  if (error) throw error
}

export const verifyOtp = async (phone, token) => {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms'
  })
  if (error) throw error
  return data
}

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
