package com.vstimemachine.judge.dao;

import com.vstimemachine.judge.model.Competition;
import org.hibernate.annotations.SQLUpdate;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import javax.transaction.Transactional;

@Transactional
public interface CompetitionRepository extends CrudRepository<Competition, Long> {

    @Override
    Competition save(@Param("competition") Competition pilot);

    @Override
    void deleteById(@Param("id") Long id);

    @Override
    void delete(@Param("competition") Competition pilot);


    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE Competition  SET selected=false", nativeQuery = true)
    void clearAllSelected();
}
