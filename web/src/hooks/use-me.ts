import { useQuery } from '@tanstack/react-query'
import { getUserInfoMeGet } from '@/gen'

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => getUserInfoMeGet(),
    staleTime: 5 * 60 * 1000,
  })
}
