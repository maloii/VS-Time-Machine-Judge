package com.vstimemachine.judge.dao;

import com.vstimemachine.judge.model.GroupSportsman;
import com.vstimemachine.judge.model.Sportsman;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import javax.transaction.Transactional;
import java.util.Optional;

@Transactional
@RepositoryRestResource(excerptProjection = GroupSportsmanProjection.class)
public interface GroupSportsmanRepository extends CrudRepository<GroupSportsman, Long> {

    @Override
    GroupSportsman save(@Param("groupSportsman") GroupSportsman groupSportsman);


    @EntityGraph(attributePaths = {"sportsman", "group"})
    Optional<GroupSportsman> findById(@Param("id") Long id);


    @Override
    void deleteById(@Param("id") Long id);

    @Override
    void delete(@Param("groupSportsman") GroupSportsman groupSportsman);

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE GROUP_SPORTSMAN  SET SEARCH_TRANSPONDER=false WHERE GROUP_ID=?1", nativeQuery = true)
    void clearAllSearch(Long groupId);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE GroupSportsman gs  SET gs.searchTransponder=true WHERE gs.id=:id")
    void searchOk(@Param("id") Long id);
}