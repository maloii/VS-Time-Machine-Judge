package com.vstimemachine.judge.dao;

import com.vstimemachine.judge.model.GroupSportsman;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import javax.transaction.Transactional;
import java.util.Optional;

@Transactional
public interface GroupSportsmanRepository extends CrudRepository<GroupSportsman, Long> {

    @Override
    GroupSportsman save(@Param("groupSportsman") GroupSportsman groupSportsman);


    @EntityGraph(attributePaths = {"sportsman", "group"})
    Optional<GroupSportsman> findById(@Param("id") Long id);


    @Override
    void deleteById(@Param("id") Long id);

    @Override
    void delete(@Param("groupSportsman") GroupSportsman groupSportsman);
}