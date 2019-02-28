package com.vstimemachine.judge.dao;

import com.vstimemachine.judge.model.Group;
import com.vstimemachine.judge.model.Round;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import javax.transaction.Transactional;
import java.util.Optional;

@Transactional
public interface GroupRepository extends CrudRepository<Group, Long> {
    @Override
    Group save(@Param("group") Group group);


    @EntityGraph(attributePaths = {"sportsmen", "round", "competition", "competition.gates"})
    Optional<Group> findById(@Param("id") Long id);

    @Override
    void deleteById(@Param("id") Long id);

    @Override
    void delete(@Param("group") Group group);


    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE groups  SET selected=false WHERE round_id=?1", nativeQuery = true)
    void clearAllSelected(Long roundId);
}
