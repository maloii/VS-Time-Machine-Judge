package com.vstimemachine.judge.dao;

import com.vstimemachine.judge.model.Pilot;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.Collection;

@PreAuthorize("hasRole('ROLE_JUDGE')")
public interface PilotRepository extends PagingAndSortingRepository<Pilot, Long> {
    @Override
    @PreAuthorize("#pilot?.judge == null or #pilot?.judge?.name == authentication?.name")
    Pilot save(@Param("pilot") Pilot pilot);

    @Override
    @PreAuthorize("@pilotRepository.findById(#id)?.judge?.name == authentication?.name")
    void deleteById(@Param("id") Long id);

    @Override
    @PreAuthorize("#pilot?.judge?.name == authentication?.name")
    void delete(@Param("pilot") Pilot pilot);
}
